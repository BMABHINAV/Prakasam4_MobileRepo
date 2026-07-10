import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, MapTrifold, WarningCircle, CheckCircle, Spinner, Image as ImageIcon } from "@phosphor-icons/react";
import { api } from "../services/api";

const REGIONS = {
  "Uttaraandra": ["Srikakulam", "Vizianagaram", "Parvathipuram Manyam", "Alluri Sitharama Raju", "Visakhapatnam", "Anakapalli"],
  "Coastal AP": ["Kakinada", "East Godavari", "Dr. B.R. Ambedkar Konaseema", "Eluru", "West Godavari", "NTR", "Krishna", "Palnadu", "Guntur", "Bapatla", "Prakasam", "Sri Potti Sriramulu Nellore"],
  "Rayalaseema": ["Kurnool", "Nandyal", "Anantapur", "Sri Sathya Sai", "YSR Kadapa", "Annamayya", "Tirupati", "Chittoor"],
};

const CATEGORIES = ["Accident", "Chain Snatching", "Robbery", "Hit & Run", "Harassment", "Other"];

export default function ReportIncident() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    region: "",
    district: "",
    category: "",
    address: "",
    description: "",
    victim_name: "",
    witness_name: "",
    witness_address: "",
    action_cause: "",
  });

  const updateForm = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.region || !formData.district)) return;
    if (step === 2 && !formData.category) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address || !formData.description) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Simulate GPS coords near district center (mock logic for demo)
      const lat = 16.3 + (Math.random() * 0.1 - 0.05);
      const lng = 80.4 + (Math.random() * 0.1 - 0.05);

      await api.reportIncident({
        ...formData,
        lat,
        lng,
        severity: "MEDIUM", // Default, AI pipeline upgrades this later
      });
      
      navigate("/confirmation", { state: { district: formData.district, category: formData.category } });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="header">
        <WarningCircle size={24} color="var(--primary)" weight="duotone" />
        <h1>Report Incident</h1>
      </header>
      
      <div className="page-container">
        {/* Step indicator */}
        <div className="step-indicator">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step-dot ${step >= s ? "active" : ""}`} />
          ))}
        </div>

        {error && (
          <div style={{ background: "#fef2f2", color: "var(--error)", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        {/* STEP 1: Location */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Where did this happen?</h2>
            <p className="text-muted mb-6">Select the district so we can route this to the correct officers.</p>
            
            <div className="form-group">
              <label className="form-label">Region</label>
              <select 
                className="form-input" 
                value={formData.region} 
                onChange={(e) => {
                  updateForm("region", e.target.value);
                  updateForm("district", "");
                }}
              >
                <option value="" disabled>Select Region</option>
                {Object.keys(REGIONS).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <select 
                className="form-input" 
                value={formData.district} 
                onChange={(e) => updateForm("district", e.target.value)}
                disabled={!formData.region}
              >
                <option value="" disabled>Select District</option>
                {formData.region && REGIONS[formData.region].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="mt-auto pt-4">
              <button 
                className="btn btn--primary" 
                disabled={!formData.district} 
                onClick={handleNext}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Category */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>What type of incident?</h2>
            <p className="text-muted mb-6">Help us categorize the report.</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {CATEGORIES.map((cat) => (
                <div 
                  key={cat}
                  onClick={() => updateForm("category", cat)}
                  style={{
                    padding: "16px",
                    border: `2px solid ${formData.category === cat ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    background: formData.category === cat ? "rgba(37,99,235,0.05)" : "var(--bg-card)",
                    textAlign: "center",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4" style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn--secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
              <button className="btn btn--primary" disabled={!formData.category} onClick={handleNext} style={{ flex: 2 }}>Next Step</button>
            </div>
          </div>
        )}

        {/* STEP 3: Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Incident Details</h2>
            <p className="text-muted mb-6">Provide a location and brief description.</p>
            
            <div className="form-group">
              <label className="form-label">Exact Location / Landmark</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                  <MapPin size={20} color="var(--text-muted)" />
                </div>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "40px" }}
                  placeholder="e.g. Near RTC Bus Stand"
                  value={formData.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                placeholder="What happened? Suspect details? Vehicle numbers?"
                value={formData.description}
                onChange={(e) => updateForm("description", e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Victim Name (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Name of the victim"
                value={formData.victim_name}
                onChange={(e) => updateForm("victim_name", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Witness Name (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Name of witness"
                value={formData.witness_name}
                onChange={(e) => updateForm("witness_name", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Witness Address (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Address or contact of witness"
                value={formData.witness_address}
                onChange={(e) => updateForm("witness_address", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Action Cause (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Known cause of the incident?"
                value={formData.action_cause}
                onChange={(e) => updateForm("action_cause", e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Photo Evidence (Optional)</label>
              <div style={{ 
                border: "2px dashed var(--border)", 
                borderRadius: "var(--radius)", 
                padding: "24px", 
                textAlign: "center",
                color: "var(--text-muted)",
                background: "var(--bg-main)"
              }}>
                <ImageIcon size={32} weight="duotone" style={{ marginBottom: "8px" }} />
                <div style={{ fontSize: "14px" }}>Tap to upload photo</div>
              </div>
            </div>

            <div className="mt-auto pt-4" style={{ display: "flex", gap: "12px" }}>
              <button type="button" className="btn btn--secondary" onClick={() => setStep(2)} disabled={isSubmitting} style={{ flex: 1 }}>Back</button>
              <button type="submit" className="btn btn--primary" disabled={!formData.address || !formData.description || isSubmitting} style={{ flex: 2 }}>
                {isSubmitting ? <Spinner size={20} className="animate-spin" /> : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
