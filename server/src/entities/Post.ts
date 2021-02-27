import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType, Int } from "type-graphql";

@ObjectType() // Added for graphQL type
@Entity()
export class Post {
  @Field(() => Int)  // Added for graphQL type, if we don't add field then it will not expose that field for GraphQL
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;
}
