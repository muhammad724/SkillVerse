declare module "swagger-ui-dist/swagger-ui-bundle.js"{
 type SwaggerUIOptions={url:string;dom_id:string;deepLinking?:boolean;persistAuthorization?:boolean;displayRequestDuration?:boolean;presets?:unknown[]};
 type SwaggerUIFactory=((options:SwaggerUIOptions)=>unknown)&{presets:{apis:unknown}};
 const SwaggerUIBundle:SwaggerUIFactory;export default SwaggerUIBundle;
}
