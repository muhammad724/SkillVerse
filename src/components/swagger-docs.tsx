"use client";
import{useEffect}from"react";import"swagger-ui-dist/swagger-ui.css";
export function SwaggerDocs(){useEffect(()=>{void import("swagger-ui-dist/swagger-ui-bundle.js").then(({default:SwaggerUIBundle})=>{SwaggerUIBundle({url:"/api/openapi",dom_id:"#swagger-ui",deepLinking:true,persistAuthorization:true,displayRequestDuration:true,presets:[SwaggerUIBundle.presets.apis]})})},[]);return <div className="swagger-shell"><div id="swagger-ui"/></div>}
