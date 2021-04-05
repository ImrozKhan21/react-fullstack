import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

// .. After we create an enityt we do 
// yarn create:migration
// which will create a Column for fields and table for Entity in database
@ObjectType() // Added for graphQL type
@Entity()
export class User {
  @Field()  // Added for graphQL type, if we don't add field then it will not expose that field for GraphQL
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field()
  @Property({ type: "text", unique: true })
  username!: string;

  @Field()
  @Property({ type: "text", unique: true, nullable: true })
  email!: string;

  @Property({ type: "text" }) // So not exposing the password as no @Field is added
  password!: string;
}
