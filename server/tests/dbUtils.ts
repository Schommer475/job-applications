import {describe, it, expect} from "@jest/globals";
import {transformCase} from "../src/db/utils";

describe("db:utils", () => {
	describe("transformCase", () => {
		it("should handle an empty array", async () => {
			expect(await transformCase([])).toEqual([]);
		});

		it("should handle a Promise", async () => {
			expect(await transformCase(new Promise<[]>(resolve => resolve([])))).toEqual([]);
		});

		it("should leave single word keys alone", async () => {
			expect(await transformCase([{
				"foo": 1,
				"bar": 2
			}])).toEqual([{
				"foo": 1,
				"bar": 2
			}]);
		});
		
		it("should transform multi-word snake case keys to camel case", async () => {
			expect(await transformCase([{
				"foo_bar": "hello",
				"foo_bar_baz": 62
			}])).toEqual([{
				"fooBar": "hello",
				"fooBarBaz": 62
			}]);
		});
		
		it("should handle a mix of multi-word and single word keys", async () => {
			expect(await transformCase([{
				"foo": 1,
				"foo_bar": "hello",
				"bar": 2,
				"foo_bar_baz": 62
			}])).toEqual([{
				"foo": 1,
				"fooBar": "hello",
				"bar": 2,
				"fooBarBaz": 62
			}]);
		});

		it("should ignore other characters", async () => {
			expect(await transformCase([{
				"foo_bar:bar_baz": 31,
			}])).toEqual([{
				"fooBar:barBaz": 31
			}]);
		});

		it("should transform all the values in the input array", async () => {
			expect(await transformCase([{
				"user_id": 143,
				"user_name": "Fred",
				"age": 40,
				"most_secret_of_secrets": "12345"
			}, {
				"user_id": 24,
				"user_name": "Angie",
				"age": 68,
				"most_secret_of_secrets": "Password"
			}])).toEqual([{
				"userId": 143,
				"userName": "Fred",
				"age": 40,
				"mostSecretOfSecrets": "12345"
			}, {
				"userId": 24,
				"userName": "Angie",
				"age": 68,
				"mostSecretOfSecrets": "Password"
			}]);
		});
	});
});