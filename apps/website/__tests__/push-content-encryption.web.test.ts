import { webcrypto as crypto } from "node:crypto";
import { expect, test, vi } from "vitest";

import { decodeBase64UrlToArrayBuffer } from "@/utils/base64url";
import {
  HMAC_hash,
  HKDF_expand,
  SHA_256_LENGTH,
  deriveKeyAndNonce,
  encryptContent,
  writeHeader,
  createCipherText,
  createECDH,
} from "@/server/utils/web-push/content-encryption.web";

vi.mock("@/env/server.mjs", () => {
  return {
    env: {},
  };
});

const salt = new TextEncoder().encode("3208123h08dsf9pnsadf");
const data = new TextEncoder().encode("this is some data");

const keyAndNonce = {
  key: new Uint8Array([
    250, 13, 71, 104, 127, 97, 86, 238, 51, 137, 76, 33, 207, 208, 201, 190,
  ]),
  nonce: new Uint8Array([90, 84, 77, 229, 216, 154, 30, 104, 88, 243, 51, 68]),
};

const publicKey = await crypto.subtle.importKey(
  "raw",
  new Uint8Array([
    4, 8, 20, 141, 180, 101, 141, 238, 108, 162, 141, 227, 138, 164, 158, 27, 0,
    237, 185, 41, 207, 192, 9, 235, 225, 215, 140, 165, 109, 52, 199, 185, 202,
    86, 81, 48, 83, 187, 141, 196, 243, 232, 241, 239, 155, 93, 230, 44, 235,
    117, 113, 115, 183, 205, 68, 234, 248, 116, 34, 206, 201, 198, 169, 68, 47,
  ]),
  { name: "ECDH", namedCurve: "P-256" },
  true,
  ["deriveBits"]
);

const authSecretStr = "ZFO3cPjB3ehHtfmB3Tdv7Q";
const dhStr =
  "BI4D-BjQz3_y_zHW4EWD90DZRe9W1hiSrlaKIRpUzlhzyVZOH9OHowPju78y424Cdwz2hJ5qNTxEzZBVsVbduYI";

test("HMAC_hash", async () => {
  const res = await HMAC_hash(salt, data);
  expect(res).toEqual(
    new Uint8Array([
      48, 244, 239, 70, 126, 92, 221, 240, 156, 217, 45, 218, 10, 32, 73, 54,
      190, 186, 215, 34, 127, 250, 146, 243, 161, 58, 92, 226, 175, 209, 190,
      12,
    ]).buffer
  );
});

test("HKDF_expand", async () => {
  const res = await HKDF_expand(salt, data, SHA_256_LENGTH);
  expect(res).toEqual(
    new Uint8Array([
      149, 15, 146, 222, 173, 232, 225, 70, 181, 192, 233, 171, 120, 127, 98,
      135, 82, 22, 27, 33, 198, 177, 249, 7, 120, 77, 182, 68, 125, 127, 223,
      188,
    ]).buffer
  );
});

test("HKDF_expand 512", async () => {
  const res = await HKDF_expand(salt, data, 512);
  expect(res).toEqual(
    new Uint8Array([
      149, 15, 146, 222, 173, 232, 225, 70, 181, 192, 233, 171, 120, 127, 98,
      135, 82, 22, 27, 33, 198, 177, 249, 7, 120, 77, 182, 68, 125, 127, 223,
      188, 88, 169, 228, 63, 230, 163, 196, 85, 18, 28, 170, 121, 238, 6, 160,
      33, 203, 187, 68, 66, 0, 89, 20, 196, 57, 242, 137, 252, 221, 120, 202,
      126, 162, 252, 232, 202, 213, 37, 45, 149, 54, 139, 175, 184, 130, 195,
      71, 111, 186, 215, 71, 160, 61, 229, 193, 23, 84, 137, 23, 159, 122, 167,
      189, 211, 142, 112, 208, 42, 32, 222, 80, 137, 57, 90, 242, 67, 186, 29,
      104, 88, 46, 247, 122, 160, 200, 16, 125, 199, 48, 166, 132, 20, 97, 165,
      165, 102, 72, 143, 45, 8, 56, 5, 40, 50, 82, 209, 25, 40, 30, 198, 10,
      101, 121, 47, 108, 18, 190, 7, 184, 31, 165, 67, 215, 187, 127, 185, 150,
      166, 34, 169, 147, 26, 184, 140, 79, 8, 87, 143, 117, 131, 181, 1, 65,
      240, 57, 181, 34, 233, 70, 172, 229, 193, 96, 77, 139, 209, 56, 210, 98,
      87, 224, 151, 188, 24, 152, 82, 76, 196, 78, 239, 215, 98, 155, 189, 172,
      13, 65, 202, 235, 182, 160, 18, 26, 120, 10, 153, 76, 1, 127, 115, 11,
      185, 180, 51, 171, 116, 226, 255, 44, 89, 228, 148, 100, 173, 220, 173,
      144, 11, 51, 162, 198, 126, 196, 92, 179, 114, 211, 75, 180, 154, 162, 86,
      43, 149, 123, 44, 94, 24, 40, 93, 65, 79, 166, 102, 148, 52, 46, 251, 125,
      143, 132, 160, 174, 206, 115, 39, 46, 51, 97, 141, 8, 114, 203, 245, 127,
      35, 134, 118, 154, 9, 132, 193, 118, 30, 10, 157, 19, 169, 33, 187, 117,
      22, 106, 55, 69, 7, 169, 185, 222, 64, 157, 207, 224, 79, 34, 239, 46, 80,
      35, 23, 67, 183, 109, 244, 102, 186, 212, 2, 173, 163, 78, 14, 9, 9, 80,
      53, 12, 6, 209, 73, 179, 8, 181, 204, 2, 131, 163, 224, 84, 6, 29, 240,
      34, 69, 69, 23, 137, 133, 101, 146, 64, 185, 107, 93, 97, 20, 175, 129,
      207, 135, 22, 95, 221, 89, 108, 31, 231, 111, 29, 209, 4, 247, 129, 40,
      157, 124, 200, 146, 37, 35, 199, 225, 99, 87, 71, 31, 110, 8, 74, 199, 89,
      206, 67, 23, 6, 246, 48, 116, 171, 60, 53, 200, 179, 8, 241, 255, 1, 112,
      169, 222, 57, 0, 193, 57, 126, 86, 58, 51, 35, 58, 115, 157, 170, 134,
      110, 254, 217, 209, 68, 213, 246, 251, 87, 83, 6, 110, 153, 78, 31, 196,
      232, 55, 177, 140, 1, 105, 213, 205, 2, 255, 182, 50, 104, 147, 202, 100,
      139, 133, 209, 237, 212, 107, 159, 184, 137, 169, 83, 249, 230, 16, 235,
      45, 65, 180, 1, 97, 66, 77, 45, 28, 169, 86, 230, 231, 24, 230, 81, 39,
      79, 15, 132, 43, 64, 186, 146, 224, 170, 15, 176, 70,
    ]).buffer
  );
});

test("createCipherText", async () => {
  const cipherText = await createCipherText(publicKey, salt, data, keyAndNonce);

  expect(cipherText).toEqual(
    new Uint8Array([
      51, 50, 48, 56, 49, 50, 51, 104, 48, 56, 100, 115, 102, 57, 112, 110, 115,
      97, 100, 102, 0, 0, 16, 0, 65, 4, 8, 20, 141, 180, 101, 141, 238, 108,
      162, 141, 227, 138, 164, 158, 27, 0, 237, 185, 41, 207, 192, 9, 235, 225,
      215, 140, 165, 109, 52, 199, 185, 202, 86, 81, 48, 83, 187, 141, 196, 243,
      232, 241, 239, 155, 93, 230, 44, 235, 117, 113, 115, 183, 205, 68, 234,
      248, 116, 34, 206, 201, 198, 169, 68, 47, 194, 161, 48, 26, 136, 212, 214,
      181, 135, 157, 215, 73, 165, 30, 103, 137, 222, 49, 30, 65, 137, 74, 51,
      24, 73, 157, 214, 13, 159, 174, 90, 26, 136, 226,
    ]).buffer
  );
});

test("encryptContent", async () => {
  const cipherText = await encryptContent(
    dhStr,
    authSecretStr,
    new TextEncoder().encode("hello world")
  );

  expect(cipherText).toBeDefined();
});

test("writeHeader", () => {
  const res = writeHeader(
    new TextEncoder().encode("Hallo"),
    4096,
    new Uint8Array([13, 234, 34, 234, 54, 34, 98, 5])
  );

  expect(res).toEqual(
    new Uint8Array([
      13, 234, 34, 234, 54, 34, 98, 5, 0, 0, 16, 0, 5, 72, 97, 108, 108, 111,
    ]).buffer
  );
});

test("deriveKeyAndNonce", async () => {
  const authSecret = decodeBase64UrlToArrayBuffer(authSecretStr);
  const dh = decodeBase64UrlToArrayBuffer(dhStr);
  const localKeypair = await createECDH();

  const { key, nonce } = await deriveKeyAndNonce({
    salt,
    localKeypair,
    dh,
    authSecret,
  });

  expect(key).toBeDefined();
  expect(nonce).toBeDefined();
  expect(key.byteLength).toBe(16);
  expect(nonce.byteLength).toBe(12);
});
