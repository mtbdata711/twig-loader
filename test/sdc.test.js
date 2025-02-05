var should = require('should');

var fs = require('fs');
var path = require('path');

var runLoader = require('./fakeModuleSystem');
var twigLoader = require('../');

var fixtures = path.join(__dirname, 'fixtures');

describe('sdc', function() {
    it('sdc', function(done) {
        var template = path.join(fixtures, 'sdc', 'component-a', 'component-a.twig');
        runLoader(
            twigLoader,
            null,
            template,
            fs.readFileSync(template, 'utf-8'),
            function(err, result) {
                if (err) throw err;

                result.should.have.type('string');
                
                done();
            },
            {
            sdc: {
                    design_system: path.resolve(__dirname, './fixtures')
                }
            }
        );
    });
});
