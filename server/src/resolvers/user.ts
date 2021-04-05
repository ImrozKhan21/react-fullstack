import { User } from "../entities/User";
import {
  Arg,
  ConflictingDefaultValuesError,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { MyContext } from "../types";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

// Object types are used to type returns in Mutataions or actuall Query and Input types are used to type Args
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });
    if (!user) {
      // email is not in db
      return true; // not show any error for security,  not tell user that emal is not
    }
    const token = v4(); //'qweqweqwe=123sada12
    // Stroing token in Redis with  user ID, so when user clicks on below a href link
    // they will send us the token and then we will look for User ID in Redis
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3 // 3 days till when they can change password
    );
    await sendEmail(
      email,
      `<a href ="http://localhost:3000/change-password/${token}">Reset Password </a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    // if you are not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    // UsernamePasswordInput is inferred inside @Args as in login call
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.username);
    let isDuplicateErr;
    let user;
    try {
      // We are using Query Builder here
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          email: options.email,
          created_at: new Date(),
          updated_at: new Date(), // Since Knex is used, key name should be same as database tabel column with
        })
        .returning("*");
      user = result[0];
      // We are not using Persist and Flush, it was throwing wierd error in some cases
      //  await em.persistAndFlush(user);
    } catch (err) {
      if (err.details.includes("already exists")) {
        isDuplicateErr = true;
      }
      if (isDuplicateErr) {
        return {
          errors: [
            {
              field: "username",
              message: "Username already exist",
            },
          ],
        };
      }
    }
    // Store user id session
    // this will set a cookue on the user
    // keep them logged in
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "username is not present",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    //TODO: Update valid to !valid For some reason valid is coming as false in correct cases too
    if (valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Password incorrect",
          },
        ],
      };
    }

    // We can store anything in session which will keep it in cookie
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      // Below will only destroy the session in
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
        }

        resolve(true);
      })
    );
  }
}
