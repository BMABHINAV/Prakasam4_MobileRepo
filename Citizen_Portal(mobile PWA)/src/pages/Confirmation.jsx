import { useLocation, Link } from "react-router-dom";
import { CheckCircle, ShieldCheck, ArrowRight } from "@phosphor-icons/react";

export default function Confirmation() {
  const { state } = useLocation();
  const district = state?.district || "your district";
  const refId = "REP-" + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="page-container" style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{
        width: "80px", height: "80px", 
        background: "rgba(34, 197, 94, 0.1)", 
        borderRadius: "40px", 
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "24px"
      }}>
        <CheckCircle size={48} color="var(--success)" weight="fill" />
      </div>

      <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px" }}>Report Submitted</h1>
      
      <p className="text-muted" style={{ marginBottom: "32px", lineHeight: "1.5" }}>
        Thank you for reporting. Your incident has been securely transmitted to the <strong>{district} Police</strong> control room in real-time.
      </p>

      <div style={{
        background: "var(--bg-main)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "20px",
        width: "100%",
        marginBottom: "32px"
      }}>
        <div className="text-muted" style={{ marginBottom: "4px" }}>Reference ID</div>
        <div style={{ fontSize: "20px", fontWeight: "600", fontFamily: "monospace", letterSpacing: "2px" }}>
          {refId}
        </div>
      </div>

      <Link to="/report" className="btn btn--secondary" style={{ width: "100%", textDecoration: "none" }}>
        Submit Another Report
      </Link>
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "32px", color: "var(--text-muted)", fontSize: "12px" }}>
        <ShieldCheck size={16} />
        <span>Powered by Agastir</span>
      </div>
    </div>
  );
}
