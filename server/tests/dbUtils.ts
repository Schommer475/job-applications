import {describe, it, expect} from "@jest/globals";
import {transformCase, structure} from "../src/db/utils";

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

	describe("structure", () => {
		it("should handle an empty array", () => {
			expect(structure([])).toEqual([]);
		});

		it("should leave keys without colons alone", () => {
			expect(structure([{
				"foo": 1,
				"bar": 2
			}])).toEqual([{
				"foo": 1,
				"bar": 2
			}]);
		});

		it("should break into nested objects at colons", () => {
			expect(structure([{
				"foo:bar": 12
			}])).toEqual([{
				foo: {
					bar: 12
				}
			}]);
		});

		it("should group keys with the same text before the colon into the same object", () => {
			expect(structure([{
				"foo:bar": 12,
				"foo:baz": "hello",
				"foo:bot": new Date("12/1/2024")
			}])).toEqual([{
				foo: {
					bar: 12,
					baz: "hello",
					bot: new Date("12/1/2024")
				}
			}]);
		});

		it("should group keys with different text before the colon into the different objects", () => {
			expect(structure([{
				"name": "James",
				"foo:bar": 12,
				"foo:baz": "hello",
				"foo:bot": new Date("12/1/2024"),
				"bar:foo": 34,
				"age": 21,
				"bar:baz": "goodbye",
				"bar:bot": new Date("2/2/2029")
			}])).toEqual([{
				name: "James",
				age: 21,
				foo: {
					bar: 12,
					baz: "hello",
					bot: new Date("12/1/2024")
				},
				bar: {
					foo: 34,
					baz: "goodbye",
					bot: new Date("2/2/2029")
				}
			}]);
		});

		it("should handle a mix of keys with and without colons", () => {
			expect(structure([{
				"foo:bar": 12,
				"foo:baz": "hello",
				"foo:bot": new Date("12/1/2024"),
				"bar:foo": 34,
				"bar:baz": "goodbye",
				"bar:bot": new Date("2/2/2029")
			}])).toEqual([{
				foo: {
					bar: 12,
					baz: "hello",
					bot: new Date("12/1/2024")
				},
				bar: {
					foo: 34,
					baz: "goodbye",
					bot: new Date("2/2/2029")
				}
			}]);
		});

		it("should operate recursively", () => {
			expect(structure([{
				"name": "Super Tech",
				"website": "super_tech_site.com",
				"position:title": "Full Stack Developer",
				"position:dateApplied": new Date("4/6/2026"),
				"position:status:id": 3,
				"position:status:name": "Interviewing",
				"position:interview:label": "Phone screen",
				"position:interview:duration:hours": 0,
				"position:interview:duration:minutes": 30
			}])).toEqual([{
				name: "Super Tech",
				website: "super_tech_site.com",
				position: {
					title: "Full Stack Developer",
					dateApplied: new Date("4/6/2026"),
					status: {
						id: 3,
						name: "Interviewing"
					},
					interview: {
						label: "Phone screen",
						duration: {
							hours: 0,
							minutes: 30
						}
					}
				}
			}]);
		});

		it("should recursively collapse empty nested objects", () => {
			expect(structure([{
				"name": "Super Tech",
				"website": "super_tech_site.com",
				"position:title": null,
				"position:dateApplied": null,
				"position:status:id": 3,
				"position:status:name": null,
				"position:interview:label": null,
				"position:interview:duration:hours": null,
				"position:interview:duration:minutes": null
			}])).toEqual([{
				name: "Super Tech",
				website: "super_tech_site.com",
				position: {
					title: null,
					dateApplied: null,
					status: {
						id: 3,
						name: null
					},
					interview: null
				}
			}]);
		});

		it("should not collapse top level objects", () => {
			expect(structure([{
				foo: null
			}])).toEqual([{
				foo: null
			}]);
		});

		it("should act on every item in the array", () => {
			expect(structure([{
				"name": "Super Tech",
				"website": "super_tech_site.com",
				"position:title": "Full Stack Developer",
				"position:dateApplied": new Date("4/6/2026"),
				"position:status:id": 3,
				"position:status:name": "Interviewing",
				"position:interview:label": "Phone screen",
				"position:interview:duration:hours": 0,
				"position:interview:duration:minutes": 30
			}, {
				"name": "Super Tech",
				"website": "super_tech_site.com",
				"position:title": null,
				"position:dateApplied": null,
				"position:status:id": 3,
				"position:status:name": null,
				"position:interview:label": null,
				"position:interview:duration:hours": null,
				"position:interview:duration:minutes": null
			}])).toEqual([{
				name: "Super Tech",
				website: "super_tech_site.com",
				position: {
					title: "Full Stack Developer",
					dateApplied: new Date("4/6/2026"),
					status: {
						id: 3,
						name: "Interviewing"
					},
					interview: {
						label: "Phone screen",
						duration: {
							hours: 0,
							minutes: 30
						}
					}
				}
			}, {
				name: "Super Tech",
				website: "super_tech_site.com",
				position: {
					title: null,
					dateApplied: null,
					status: {
						id: 3,
						name: null
					},
					interview: null
				}
			}]);
		});
	});
});