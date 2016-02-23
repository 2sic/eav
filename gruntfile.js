/// <binding />
module.exports = function(grunt) {
    "use strict";
    var distRoot = "dist/";
    var tmpRoot = "tmp/";
    var admin = {
        cwd: "src/admin/",
        cwdJs: ["src/admin/**/*.js"],
        tmp: "tmp/admin/",
        templates: "tmp/admin/html-templates.js",
        dist: "dist/admin/",
        concatFile: "dist/admin/eav-admin.js",
        uglifyFile: "dist/admin/eav-admin.min.js",
        concatCss: "dist/admin/eav-admin.css",
        concatCssMin: "dist/admin/eav-admin.min.css"
    };

    var editUi = {
        cwd: "src/edit/",
        cwdJs: "src/edit/**/*.js",
        tmp: "tmp/edit/",
        templates: "tmp/edit/html-templates.js",
        dist: "dist/edit/",
        concatFile: "dist/edit/eav-edit.js",
        uglifyFile: "dist/edit/eav-edit.min.js",
        concatCss: "dist/edit/edit.css",
        concatCssMin: "dist/edit/edit.min.css"
    };

    var i18n = {
        cwd: "src/i18n/",
        dist: "dist/i18n/"
    };

    var configConstants = {
        ngTemplatesHtmlMin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: false,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        }
    };

    var concatPipelineCss = "pipeline-designer.css";

    var js = {
        eav: {
            "src": "eav/js/src/**/*.js",
            "specs": "eav/js/specs/**/*spec.js",
            "helpers": "eav/js/specs/helpers/*.js"
        }
    };

    grunt.initConfig();

    // Project configuration.
    grunt.config.merge({
        pkg: grunt.file.readJSON("package.json"),

        paths: {
            bower: "bower_components",
            dist: "dist",
            libs: "libs",
            publish: "publish",
            src: "src",
            temp: "tmp",
            tests: "tests"
        },

        jshint: {
            mainApp: ["gruntfile.js", admin.cwdJs, editUi.cwdJs]
        },

        clean: {
            mainAppTmp: tmpRoot + "**/*",
            dist: "dist/**/*"
        },

        copy: {
            mainApp: {
                files: [
                    {
                        expand: true,
                        cwd: admin.cwd,
                        src: ["**", "!**/*spec.js", "!**/tests/**"],
                        dest: admin.tmp
                    },
                    {
                        expand: true,
                        cwd: editUi.cwd,
                        src: ["**", "!**/*spec.js", "!**/tests/**"],
                        dest: editUi.tmp
                    }
                ]
            },
            mainAppi18n: {
                files: [
                    {
                        expand: true,
                        cwd: "src/i18n/", 
                        src: ["**/*.json"],
                        dest: "dist/i18n/", 
                        rename: function(dest, src) {
                            return dest + src.replace(".json",".js");
                        }
                    }

                ]
            }
        },
        ngtemplates: {
            mainApp: {
                options: {
                    module: "eavTemplates",
                    // append: true,
                    standalone: true,
                    htmlmin: configConstants.ngTemplatesHtmlMin
                },
                files: [
                    {
                        cwd: admin.tmp,
                        src: ["**/*.html"],
                        dest: admin.templates
                    }
                ]
            },
            mainAppEdit: {
                options: {
                    module: "eavEditTemplates",
                    // append: true,
                    standalone: true,
                    htmlmin: configConstants.ngTemplatesHtmlMin
                },
                files: [
                     {
                         cwd: editUi.tmp,
                         src: ["**/*.html"], 
                         dest: editUi.templates
                     }
                ]

            }
        },
        concat: {
            mainApp: {
                src: admin.tmp + "**/*.js",
                dest: admin.concatFile
            },
            mainAppAdminCss: {
                src: admin.tmp + "**.css",
                dest: admin.concatCss
            },
            mainAppEditUi: {
                src: editUi.tmp + "**/*.js",
                dest: editUi.concatFile
            },
            mainAppPipelineCss: {
                src: [admin.tmp + "pipelines/pipeline-designer.css"],
                dest: admin.dist + concatPipelineCss
            },
            mainAppEditUiCss: {
                src: [editUi.tmp + "**/*.css"],
                dest: editUi.concatCss
            }

        },
        ngAnnotate: {
            mainApp: {
                expand: true,
                src: admin.concatFile,
                extDot: "last"          // Extensions in filenames begin after the last dot 
            },
            mainAppEditUi: {
                expand: true,
                src: editUi.concatFile,
                extDot: "last"          // Extensions in filenames begin after the last dot 
            }

        },


        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"yyyy-mm-dd hh:MM\") %> */\n",
                sourceMap: true
            },

            mainApp: {
                src: admin.concatFile,
                dest: admin.uglifyFile
            },
            mainAppEditUi: {
                src: editUi.concatFile,
                dest: editUi.uglifyFile
            }
        },
        
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            mainApp: {
                files: [{
                    expand: true,
                    cwd: distRoot,
                    src: ["**/*.css", "!**/*.min.css"],
                    dest: distRoot,
                    ext: ".min.css"
                }
                ]
            }
        },

        //compress: {
        //    mainApp: {
        //        options: {
        //            mode: "gzip"
        //        },
        //        expand: true,
        //        cwd: distRoot,
        //        src: ["**/*.min.js"],
        //        dest: distRoot,
        //        ext: ".gz.js"
        //    }
        //},

        jasmine: {
            default: {
                // Your project's source files
                src: js.eav.src,
                options: {
                    // Your Jasmine spec files 
                    specs: js.eav.specs,
                    // Your spec helper files
                    helpers: js.eav.helpers
                }
            }
        },

        watch: {
            ngUi: {
                files: ["gruntfile.js", admin.cwd + "**", editUi.cwd + "**"],
                tasks: ["build"]
            },
            devEavMlJson: {
                files: ["gruntfile.js", js.eav.src, js.eav.specs],
                tasks: ["jasmine:default", "jasmine:default:build"]                
            }
        }
    });

    // Load all grunt-plugins mentioned in the package.json
    require("load-grunt-tasks")(grunt);
    require("time-grunt")(grunt);
    

    // Default task.
    grunt.registerTask("build", [
        "jshint:mainApp",
        "clean:mainAppTmp",
        "copy:mainApp",
        "copy:mainAppi18n",
        "ngtemplates:mainApp",
        "ngtemplates:mainAppEdit",
        "concat:mainApp",
        "concat:mainAppAdminCss",
        "concat:mainAppEditUi",
        "concat:mainAppPipelineCss",
        "concat:mainAppEditUiCss",
        "ngAnnotate:mainApp",
        "ngAnnotate:mainAppEditUi",
        "uglify:mainApp",
        "uglify:mainAppEditUi",
        "cssmin:mainApp",
        //"clean:tmp",
        
    ]);

    grunt.registerTask("build-auto", ["build", "watch:ngUi"]);
    grunt.registerTask("lint", "jshint");
    grunt.registerTask("default", "jasmine");
    grunt.registerTask("manualDebug", "jasmine:default:build");
    grunt.registerTask("quickDebug", "quickly log a test", function() {
        grunt.log(admin.cwdJs);
    });
     
    // External tasks
    grunt.task.loadTasks("grunt-tasks/angular-set");
    grunt.task.loadTasks("grunt-tasks/jsplumb-clean");
    grunt.task.loadTasks("grunt-tasks/i18n");
    grunt.task.loadTasks("grunt-tasks/ag-grid");
    grunt.task.loadTasks("grunt-tasks/icons");
    grunt.task.loadTasks("grunt-tasks/import-languages");

    // custom field
    grunt.task.loadTasks("grunt-tasks/edit-extended-custom-gps");

};