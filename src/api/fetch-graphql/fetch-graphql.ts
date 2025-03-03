import { FetchGraphQL } from '@adobe-commerce/fetch-graphql';

export const {
  setEndpoint,
  setFetchGraphQlHeader,
  removeFetchGraphQlHeader,
  setFetchGraphQlHeaders,
  fetchGraphQl,
  getConfig,
} = new FetchGraphQL().getMethods();
