var path = require("path");
var hashGenerator = require("hasha");
var _ = require("underscore");
var loaderUtils = require("loader-utils");
var mapcache = require("./mapcache");

module.exports = function(options) {
    return function(id, tokens, pathToTwig) {
        var includes = [];
        var resourcePath = mapcache.get(id);
        var processDependency = function(token) {
            if(options.paths && !/^[.\/]/.test(token.value)) {
                options.paths.forEach(templatePath => {
                    let resolvedPath = path.resolve(templatePath, token.value);
                    let relativePath = './' + path.relative(path.dirname(resourcePath), resolvedPath);
                    includes.push(relativePath);
                    token.value = hashGenerator(resolvedPath);
                })
            } else {
                includes.push(token.value);
                token.value = hashGenerator(path.resolve(path.dirname(resourcePath), token.value));
            }
        };

        var processToken = function(token) {
            if (token.type == "logic" && token.token.type) {
                switch(token.token.type) {
                    case 'Twig.logic.type.block':
                    case 'Twig.logic.type.if':
                    case 'Twig.logic.type.elseif':
                    case 'Twig.logic.type.else':
                    case 'Twig.logic.type.for':
                    case 'Twig.logic.type.spaceless':
                    case 'Twig.logic.type.macro':
                        _.each(token.token.output, processToken);
                        break;
                    case 'Twig.logic.type.extends':
                    case 'Twig.logic.type.include':
                        _.each(token.token.stack, processDependency);
                        break;
                    case 'Twig.logic.type.embed':
                        _.each(token.token.output, processToken);
                        _.each(token.token.stack, processDependency);
                        break;
                    case 'Twig.logic.type.import':
                    case 'Twig.logic.type.from':
                        if (token.token.expression != '_self') {
                            _.each(token.token.stack, processDependency);
                        }
                        break;
                }
            }
        };

        var parsedTokens = JSON.parse(tokens);

        _.each(parsedTokens, processToken);

        var opts = Object.assign({}, options.twigOptions, {
            id: id,
            data: parsedTokens,
            allowInlineIncludes: true,
            rethrow: true,
        });
        var output = [
            'var Twig = require("' + pathToTwig + '"),',
            '    template = Twig.twig(' + JSON.stringify(opts) + ');\n',
        ];
        if (options.extender) {
            output.push(
                'require("' + options.extender + '").default(Twig);\n'
            );
        }
        output.push(
            'module.exports = function(context) { return template.render(context); }'
        );

        if (includes.length > 0) {
            _.each(_.uniq(includes), function(file) {
                output.unshift("require("+ JSON.stringify(file) +");\n");
            });
        }

        return output.join('\n');
    };
};
