import { UserDto } from '../api/auth/dto';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config, storagePath } from '../../lib/config';
import * as argon from 'argon2';
import { Folder } from '../api';

export const signToken = async (user: UserDto) => {
  const payload: JwtPayload = {
    sub: user.uuid,
    email: user.email,
    jti: uuidv4(),
  };

  const jwt_key = (config.get('jwtkey') || process.env.SECRET_KEY)?.toString();
  const lifeTime = config.get('authexp')?.toString();

  if (!jwt_key) {
    throw new JsonWebTokenError(
      `No jwt_key for authentication provided. Run lcs config --jwtkey=<key>`,
    );
  }

  return jwt.sign(payload, jwt_key, {
    expiresIn: lifeTime ?? '30d',
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  const hashConfig: argon.Options = {
    timeCost: 10,
    type: argon.argon2id,
  };

  return await argon.hash(password, hashConfig);
};

export const createUserDirectory = async (
  name: string,
): Promise<string | undefined> => {
  return await new Folder(name).create(storagePath);
};
