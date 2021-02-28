import React from "react";
import { Form, Formik } from "formik";
import { FormControl, Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useLoginMutation, useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

interface registerProps {}

// In NEXT.JS, any page in pages folder is a route automatically
export const Login: React.FC<registerProps> = ({}) => {
  const router = useRouter(); // Next JS provides it
  //First item in THE BELOW [, regitser] is state in which mutation is like fetching, we don't need it yet
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          // Since values matches with GraphQl mutation values like $username and $password,
          // so we don't need too change anything here in register()
          const response = await login({options: values}); // Since we used $options in Mutation, we pass itlike this here
          if (response.data?.login.errors) {
            //Our error response we set on server is like
            // [{field: 'username', message: 'something wrong}] so we create a utility toErrorMap
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormControl>
              <InputField
                name="username"
                placeholder="Username"
                label="Username"
              />

              <Box mt={4}>
                <InputField
                  name="password"
                  placeholder="Password"
                  label="Password"
                  type="password"
                />
              </Box>

              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                variant="solid"
              >
                Login
              </Button>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
