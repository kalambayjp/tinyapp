const { assert } = require('chai');
const { verifyEmail } = require('../helpers.js');
const {users} = require('../databases');

describe('verifyEmail', function() {
  it(`Should return an error message of 'No Email was given!' if email is an empty string`, () => {
    const result = verifyEmail('', users);
    assert.strictEqual(result.error, "No Email was given!")
  })

  it(`should have a error value of null if email is is not an empty string and not found in users object`, () => {
    const result = verifyEmail('howdy@cowboy.com', users);
    assert.strictEqual(result.error, null);
  })
})
