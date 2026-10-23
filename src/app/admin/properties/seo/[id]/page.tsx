import { SeoWorkspace } from "../../../seo-workspace";
export default async function Page({params}: {params:Promise<{id:string}>}) {const {id}=await params; return <SeoWorkspace module="property" initialId={id} />;}
