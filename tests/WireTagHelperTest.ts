import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { WireTagHelper } from '../src/WireTagHelper';

test('tagsize', () => {
    let tmp = 50
    while (tmp < 1000*1000*1000) {
        assert.is(WireTagHelper.getTagSizeFromComplier(tmp), WireTagHelper.getTagSizeFromJava(tmp))
        tmp += 10000
    }
});

test('__builtin_clz', () => {
	assert.is(WireTagHelper.__builtin_clz(0x1), 31)
	assert.is(WireTagHelper.__builtin_clz(0x2), 30)
	assert.is(WireTagHelper.__builtin_clz(0x4), 29)
	assert.is(WireTagHelper.__builtin_clz(0x8), 28)
	assert.is(WireTagHelper.__builtin_clz(0x10), 27)
	assert.is(WireTagHelper.__builtin_clz(0xfffffff), 4)
	assert.is(WireTagHelper.__builtin_clz(0x1fffffff), 3)
	assert.is(WireTagHelper.__builtin_clz(0x2fffffff), 2)
	assert.is(WireTagHelper.__builtin_clz(0x4fffffff), 1)
	assert.is(WireTagHelper.__builtin_clz(0x8fffffff), 0)
	assert.is(WireTagHelper.__builtin_clz(0xffffffff), 0)
});

test.run();