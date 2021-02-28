import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;
  // dat ais loading
  if (fetching) {
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link color={"white"} mr={4}>
            Login
          </Link>
        </NextLink>

        <NextLink href="/register">
          <Link color={"white"}>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box mr={2} color={"white"}>
          {data?.me?.username}
        </Box>
        <Button variant="link">Logout</Button>
      </Flex>
    );
  }
  return (
    <Flex bg="black" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
