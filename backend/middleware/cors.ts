export default async (ctx: any, next: Function) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    if (ctx.request.method === "OPTIONS") {
        ctx.response.status = 200;
    } else {
        await next();
    }
};
