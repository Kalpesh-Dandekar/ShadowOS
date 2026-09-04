import { ApprovalDetailScreen } from "../../../features/approvals/approval-detail-screen";
export default async function Page({params}:{params:Promise<{approvalId:string}>}){const {approvalId}=await params;return <ApprovalDetailScreen approvalId={approvalId}/>;}
