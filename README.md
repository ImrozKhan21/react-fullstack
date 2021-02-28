# Example app with [chakra-ui](https://github.com/chakra-ui/chakra-ui)
graphql Code gen is used to create queries and mutations,
for that, we need to  have folder, graphql in src, which will have mutations and queries inside it.
Then after that we will run command
graphql-codegen --config codegen.yml
which will generate a file in generated folder --> graphql.tsx