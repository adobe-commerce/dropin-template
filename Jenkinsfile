#!/usr/bin/env groovy

@Library(['magento-saas-pipeline@0.8.6',  'storefront-shared-libraries']) _

// TODO: in Jenkins UI duplicate job dropin-template and update the Github project URL and credentials if needed.
pipeline {
    agent { node { label 'corgeesejenkinsnode' }}
    tools { nodejs 'node-16.14' }

    parameters {
        string(
            name: 'RELEASE_TAG_NAME',
            defaultValue: '',
            description: 'Version of the published package - should be only of the format major.minor.patch-(beta) or major.minor.patch'
        )
    }

    environment {
        ARTIFACTORY_BASE_URL = 'https://artifactory-uw2.adobeitc.com/artifactory'
        DROPINS_CHANNEL = '#dropins-releases'
        ARTIFACTORY_CORP_URL = 'https://artifactory.corp.adobe.com/artifactory'
    }

    stages {
        stage('Start publishing to NPM') {
            stages {
                stage('Add Artifactory Tokens') {
                    steps {
                        withVaultSecrets(
                            'https://vault-amer.adobe.net',
                            'vault-app-role',
                            [
                                'dx_corgeese/CI/artifactory-auth': [
                                    'ARTIFACTORY_USERNAME': 'username',
                                    'ARTIFACTORY_TOKEN': 'api_key',
                                    'ARTIFACTORY_CORP_TOKEN':'corp_api_key',
                                ]
                            ]
                        ) {
                            dir("${env.WORKSPACE}"){
                                script {
                                    sh "curl -u ${ARTIFACTORY_USERNAME}:${ARTIFACTORY_TOKEN} \"${env.ARTIFACTORY_BASE_URL}/api/npm/auth\" >> .npmrc"
                                    sh "curl -u ${ARTIFACTORY_USERNAME}:${ARTIFACTORY_CORP_TOKEN} ${ARTIFACTORY_CORP_URL}/api/npm/npm-adobe-release-local/auth/exc >> .npmrc"
                                }
                            }
                        }
                    }
                }

                stage('Publish my-domain-package bundles to NPM') { 
                    steps {
                        withVaultSecrets(
                            'https://vault-amer.adobe.net',
                            'vault-app-role',
                            [
                                'dx_corgeese/CI/npm': [
                                    'NPM_TOKEN':'npm_token'
                                ]
                            ]) {
                                dir("${env.WORKSPACE}"){
                                    script {
                                        // yarn creates directories under /apps. when running on jenkins slave, centos user needs permissions on /apps
                                        sh 'sudo mkdir -p /apps'
                                        sh 'sudo chmod -R o+rwx /apps'
                                        sh 'mkdir -p .yarncache'
                                
                                        // Install dependencies
                                        sh 'yarn install --cache-folder .yarncache'

                                        // Build my-domain-packages dist bundles
                                        sh 'yarn build'

                                        // Set variables for package.json
                                        env.PROJECT_NAME = readJSON(file: 'package.json').name
                                        env.ELSIE_VERSION = readJSON(file: 'package.json').dependencies.'@adobe/elsie'

                                        // Create dist folder
                                        sh 'mkdir -p .dist'

                                        dir('dist') {
                                            def VERSION = params.RELEASE_TAG_NAME.replaceAll(/^v/, '')
                                            def JSON_OBJECT="{\"name\": \"$PROJECT_NAME\", \"version\": \"$VERSION\", \"@dropins/tools\": \"$ELSIE_VERSION\"}"

                                            // Create package.json
                                            sh "echo '$JSON_OBJECT' > package.json"

                                            // Publish to public NPM
                                            sh "echo \"//registry.npmjs.org/:_authToken=${NPM_TOKEN}\" > .npmrc"
                                            sh 'npm publish --access public'
                                        }
                                    }
                                }
                        }    
                    }   
                }
            }
            post {
                success {
                    script {
                        slackSend color: "good", message: "Version ${RELEASE_TAG_NAME} of ${env.PROJECT_NAME} dropin has been released."
                    }
                }

                failure {
                    script {
                        slackSend color: "bad", message: "Something went wrong, failed to release ${env.PROJECT_NAME} ${RELEASE_TAG_NAME}."
                    }
                }

                always {
                    cleanWs()
                }
            }
        }
    }
}
