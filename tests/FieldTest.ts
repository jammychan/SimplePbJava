import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Field } from '../src/ProtoField';

test('fieldname', () => {
	assert.type(Field.underline2CamelCase, 'function');
	assert.is(Field.underline2CamelCase("given_name"), "givenName");
	assert.is(Field.underline2CamelCase("ab_cd_ef_g"), "abCdEfG");
});

test.run();