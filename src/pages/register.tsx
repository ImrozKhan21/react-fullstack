import React from "react";
import { Form, Formik } from "formik";
import { FormControl, Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";

interface registerProps {}

// In NEXT.JS, any page in pages folder is a route automatically
export const Register: React.FC<registerProps> = ({}) => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          console.log("VAL", values);
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
                Register
              </Button>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
