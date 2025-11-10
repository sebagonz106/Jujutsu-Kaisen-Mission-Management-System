using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace GestionDeMisiones.Conventions
{
    /// <summary>
    /// Application model convention that enforces an API version prefix for controller routes.
    /// It updates existing attribute routes that start with "api/" to become "api/v1/..." and
    /// also ensures controllers without attribute routes receive a route using the prefix.
    /// </summary>
    public class RoutePrefixConvention : IApplicationModelConvention
    {
        private readonly string _prefix;

        public RoutePrefixConvention(string prefix)
        {
            if (string.IsNullOrWhiteSpace(prefix)) throw new ArgumentException("prefix required", nameof(prefix));
            // Normalize: remove leading/trailing slashes
            _prefix = prefix.Trim('/');
        }

        public void Apply(ApplicationModel application)
        {
            foreach (var controller in application.Controllers)
            {
                foreach (var selector in controller.Selectors)
                {
                    var attr = selector.AttributeRouteModel;
                    if (attr != null && !string.IsNullOrEmpty(attr.Template))
                    {
                        var template = attr.Template.Trim('/');
                        // If the controller already has an 'api/...' prefix, replace it to include the version
                        if (template.StartsWith("api/", StringComparison.OrdinalIgnoreCase))
                        {
                            // If it already contains a version (api/v...), skip modification
                            if (template.StartsWith("api/v", StringComparison.OrdinalIgnoreCase))
                            {
                                // leave as-is
                                attr.Template = template;
                            }
                            else
                            {
                                var rest = template.Substring(4); // remove "api/"
                                attr.Template = _prefix + (string.IsNullOrEmpty(rest) ? string.Empty : "/" + rest);
                            }
                        }
                        else
                        {
                            // Otherwise just prepend the prefix
                            attr.Template = _prefix + "/" + template;
                        }
                    }
                    else if (attr == null)
                    {
                        // No attribute route; add a simple route using controller name
                        selector.AttributeRouteModel = new AttributeRouteModel(new RouteAttribute(_prefix + "/" + controller.ControllerName));
                    }
                }
            }
        }
    }
}
