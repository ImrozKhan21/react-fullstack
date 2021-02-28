import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import { Provider, createClient, dedupExchange, fetchExchange } from "urql";
import { cacheExchange, QueryInput, Cache } from "@urql/exchange-graphcache";
import theme from "../theme";
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

// Below is urql client
const client = createClient({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include",
  },
   // So below code is ran, whenevr Register and Login Mutation returns,
   // it is used to update cache of MeQuery, so that when we login it doesn't get the values from cache
   // which can be a case that once you are login page, mequery runs and shows back nothing
   // and once you login mequery just takes result from cachce and doesn't give the current user if below is not implemented
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          login: (_result, args, cache, info) => {
            // cache.updateQuery({ query: MeDocument }, (data) => { });
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query : any) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },

          register: (_result, args, cache, info) => {
            // cache.updateQuery({ query: MeDocument }, (data) => { });
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query : any) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
    fetchExchange,
  ],
});

function MyApp({ Component, pageProps }: any) {
  return (
    // Provider also comes from urql to provide the client to all of the app
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
