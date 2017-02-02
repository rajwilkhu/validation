System.register(["aurelia-dependency-injection", "aurelia-pal", "./validation-controller", "./validate-trigger"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var aurelia_dependency_injection_1, aurelia_pal_1, validation_controller_1, validate_trigger_1, ValidateBindingBehaviorBase;
    return {
        setters: [
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (aurelia_pal_1_1) {
                aurelia_pal_1 = aurelia_pal_1_1;
            },
            function (validation_controller_1_1) {
                validation_controller_1 = validation_controller_1_1;
            },
            function (validate_trigger_1_1) {
                validate_trigger_1 = validate_trigger_1_1;
            }
        ],
        execute: function () {
            /**
             * Binding behavior. Indicates the bound property should be validated.
             */
            ValidateBindingBehaviorBase = (function () {
                function ValidateBindingBehaviorBase(taskQueue) {
                    this.taskQueue = taskQueue;
                }
                /**
                 * Gets the DOM element associated with the data-binding. Most of the time it's
                 * the binding.target but sometimes binding.target is an aurelia custom element,
                 * or custom attribute which is a javascript "class" instance, so we need to use
                 * the controller's container to retrieve the actual DOM element.
                 */
                ValidateBindingBehaviorBase.prototype.getTarget = function (binding, view) {
                    var target = binding.target;
                    // DOM element
                    if (target instanceof Element) {
                        return target;
                    }
                    // custom element or custom attribute
                    // tslint:disable-next-line:prefer-const
                    for (var i = 0, ii = view.controllers.length; i < ii; i++) {
                        var controller = view.controllers[i];
                        if (controller.viewModel === target) {
                            var element = controller.container.get(aurelia_pal_1.DOM.Element);
                            if (element) {
                                return element;
                            }
                            throw new Error("Unable to locate target element for \"" + binding.sourceExpression + "\".");
                        }
                    }
                    throw new Error("Unable to locate target element for \"" + binding.sourceExpression + "\".");
                };
                ValidateBindingBehaviorBase.prototype.bind = function (binding, source, rulesOrController, rules) {
                    var _this = this;
                    // identify the target element.
                    var target = this.getTarget(binding, source);
                    // locate the controller.
                    var controller;
                    if (rulesOrController instanceof validation_controller_1.ValidationController) {
                        controller = rulesOrController;
                    }
                    else {
                        controller = source.container.get(aurelia_dependency_injection_1.Optional.of(validation_controller_1.ValidationController));
                        rules = rulesOrController;
                    }
                    if (controller === null) {
                        throw new Error("A ValidationController has not been registered.");
                    }
                    controller.registerBinding(binding, target, rules);
                    binding.validationController = controller;
                    var trigger = this.getValidateTrigger(controller);
                    // tslint:disable-next-line:no-bitwise
                    if (trigger & validate_trigger_1.validateTrigger.change) {
                        binding.standardUpdateSource = binding.updateSource;
                        // tslint:disable-next-line:only-arrow-functions
                        binding.updateSource = function (value) {
                            this.standardUpdateSource(value);
                            this.validationController.validateBinding(this);
                        };
                    }
                    // tslint:disable-next-line:no-bitwise
                    if (trigger & validate_trigger_1.validateTrigger.blur) {
                        binding.validateBlurHandler = function () {
                            _this.taskQueue.queueMicroTask(function () { return controller.validateBinding(binding); });
                        };
                        binding.validateTarget = target;
                        target.addEventListener('blur', binding.validateBlurHandler);
                    }
                    if (trigger !== validate_trigger_1.validateTrigger.manual) {
                        binding.standardUpdateTarget = binding.updateTarget;
                        // tslint:disable-next-line:only-arrow-functions
                        binding.updateTarget = function (value) {
                            this.standardUpdateTarget(value);
                            this.validationController.resetBinding(this);
                        };
                    }
                };
                ValidateBindingBehaviorBase.prototype.unbind = function (binding) {
                    // reset the binding to it's original state.
                    if (binding.standardUpdateSource) {
                        binding.updateSource = binding.standardUpdateSource;
                        binding.standardUpdateSource = null;
                    }
                    if (binding.standardUpdateTarget) {
                        binding.updateTarget = binding.standardUpdateTarget;
                        binding.standardUpdateTarget = null;
                    }
                    if (binding.validateBlurHandler) {
                        binding.validateTarget.removeEventListener('blur', binding.validateBlurHandler);
                        binding.validateBlurHandler = null;
                        binding.validateTarget = null;
                    }
                    binding.validationController.unregisterBinding(binding);
                    binding.validationController = null;
                };
                return ValidateBindingBehaviorBase;
            }());
            exports_1("ValidateBindingBehaviorBase", ValidateBindingBehaviorBase);
        }
    };
});
