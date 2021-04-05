import {
  Field,
  InputType
} from "type-graphql";


@InputType() // For multiple args we can create like this
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;
}
