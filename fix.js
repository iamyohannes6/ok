var fs = require('fs');
var oldlib = `
import { createHash } from 'crypto';
export const splDiscriminate = (discriminator, length = 8) => {
    const digest = createHash('sha256').update(discriminator).digest();
    return digest.subarray(0, length);
};
//# sourceMappingURL=splDiscriminate.js.map`;
var fixlib = `
import crypto from 'crypto';
export const splDiscriminate = (discriminator, length = 8) => {
    const digest = crypto.createHash('sha256').update(discriminator).digest();
    return digest.subarray(0, length);
};
//# sourceMappingURL=splDiscriminate.js.map
`;
if (fs.existsSync('./node_modules')) {
    let path = "./node_modules/@solana/spl-type-length-value/lib/esm/splDiscriminate.js";
    console.log("modules here");
    var data;
    try {
        data = fs.readFileSync(path, 'utf-8');
    } catch (e) {
        console.log("no lib found");
        return;
    }
    try {
        fs.writeFileSync(path, fixlib, 'utf-8');
    } catch (e) {
        console.log("unable to write lib, give permission");
        return;
    }
    console.log("fix implemented");
} else if (fs.existsSync('../node_modules')) {
    console.log("modules upper");
    let path = "../node_modules/@solana/spl-type-length-value/lib/esm/splDiscriminate.js";
    var data;
    try {
        data = fs.readFileSync(path, 'utf-8');
    } catch (e) {
        console.log("no lib found");
        return;
    }
    try {
        fs.writeFileSync(path, fixlib, 'utf-8');
    } catch (e) {
        console.log("unable to write lib, give permission");
        return;
    }
    console.log("fix implemented");
} else if (fs.existsSync('../../node_modules')) {
    console.log("modules upper x2");
    let path = "../../node_modules/@solana/spl-type-length-value/lib/esm/splDiscriminate.js";
    var data;
    try {
        data = fs.readFileSync(path, 'utf-8');
    } catch (e) {
        console.log("no lib found");
        return;
    }
    console.log(data);
    try {
        fs.writeFileSync(path, fixlib, 'utf-8');
    } catch (e) {
        console.log("unable to write lib, give permission");
        return;
    }
    console.log("fix implemented");
} else if (fs.existsSync('../../../node_modules')) {
    console.log("modules upper x3");
    let path = "../../../node_modules/@solana/spl-type-length-value/lib/esm/splDiscriminate.js";
    var data;
    try {
        data = fs.readFileSync(path, 'utf-8');
    } catch (e) {
        console.log("no lib found");
        return;
    }
    console.log(data);
    try {
        fs.writeFileSync(path, fixlib, 'utf-8');
    } catch (e) {
        console.log("unable to write lib, give permission");
        return;
    }
    console.log("fix implemented");
} else {
    console.log("no modules found");
}
return;