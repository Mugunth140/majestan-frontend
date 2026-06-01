"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

export function RentSellPropertyView(): React.JSX.Element {
  const [formData, setFormData] = useState({
    name: "",
    mobilenumber: "",
    location: "",
    dealtype: "",
    propertyType: "",
    size: "",
    rooms: "",
    furnishing_status: "",
    ageofproperty: "",
    propertyCondition: "",
    price: "",
    property_details: "",
    image: null as File | null,
  });

  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion(`${num1} + ${num2}`);
    setCaptchaAnswer(num1 + num2);
    setUserCaptcha("");
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userCaptcha) !== captchaAnswer) {
      setCaptchaError(true);
      return;
    }
    setCaptchaError(false);
    setIsSubmitting(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        data.append(key, value as string | Blob);
      }
    });

    try {
      const response = await fetch("/Home/insertproperty", {
        method: "POST",
        body: data,
      });
      const result = await response.text();
      if (result === "Yes") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Property Details Submitted Successfully",
          confirmButtonColor: "#28a745",
          background: "#ffffff",
          color: "#171717",
        }).then(() => {
          window.location.href = "/";
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again!",
        confirmButtonColor: "#d33",
        background: "#ffffff",
        color: "#171717",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --glass-bg: rgba(255, 255, 255, 0.9);
          --glass-border: rgba(0, 0, 0, 0.08);
          --primary-glow: rgba(39, 66, 127, 0.15);
          --primary-color: #27427f;
          --secondary-color: #ffc900;
          --text-primary: #171717;
          --text-secondary: #5c5e61;
          --input-bg: #ffffff;
          --input-border: #d9d9d9;
        }

        .rent-sell-container {
          min-height: 100vh;
          background: url('/assets/images/home/rent_sell_bg_light_modern.png') no-repeat center center fixed;
          background-size: cover;
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--text-primary);
          padding: 80px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .rent-sell-container::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(248, 249, 250, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1;
        }

        .form-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 900px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 50px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08), 0 5px 15px rgba(0, 0, 0, 0.03);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .form-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 15px;
          color: var(--primary-color);
          letter-spacing: -0.5px;
        }

        .form-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .input-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
          transition: color 0.3s;
        }

        .input-group input, .input-group select {
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 12px;
          padding: 14px 18px;
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
          appearance: none;
        }

        .input-group select {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232c2e33' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 15px center;
          background-size: 16px;
        }
        
        .input-group select option {
          background: #ffffff;
          color: #171717;
        }

        .input-group input:focus, .input-group select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px var(--primary-glow);
          background: #ffffff;
        }

        .input-group input:focus + label, .input-group select:focus + label {
          color: var(--primary-color);
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .file-upload-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: var(--input-bg);
          border: 1px dashed var(--input-border);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .file-upload-wrapper:hover {
          border-color: var(--primary-color);
          background: rgba(39, 66, 127, 0.02);
        }

        .file-upload-btn {
          background: rgba(39, 66, 127, 0.08);
          border: 1px solid var(--primary-color);
          color: var(--primary-color);
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .file-upload-btn:hover {
          background: var(--primary-color);
          color: #ffffff;
          box-shadow: 0 5px 15px var(--primary-glow);
        }

        .file-upload-btn:hover svg {
          stroke: #ffffff;
        }

        .file-input {
          position: absolute;
          left: 0; top: 0; width: 100%; height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .preview-image {
          max-width: 100px;
          max-height: 100px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid var(--input-border);
        }

        .captcha-group {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(0, 0, 0, 0.03);
          padding: 15px;
          border-radius: 12px;
          border: 1px solid var(--input-border);
          margin-bottom: 30px;
        }

        .captcha-question {
          background: #ffffff;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1.2rem;
          color: var(--primary-color);
          letter-spacing: 2px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          user-select: none;
        }

        .captcha-input {
          flex: 1;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--text-primary);
          font-size: 1rem;
          outline: none;
        }

        .captcha-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px var(--primary-glow);
        }

        .refresh-btn {
          background: none;
          border: 1px solid var(--input-border);
          color: var(--text-primary);
          width: 40px; height: 40px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex; justify-content: center; align-items: center;
          background: #fff;
        }

        .refresh-btn:hover {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: #fff;
        }

        .submit-btn {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 14px;
          background: var(--primary-color);
          color: #ffffff;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: "";
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: all 0.5s;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px var(--primary-glow);
          background: #1e3366;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .error-text {
          color: #ff4d4f;
          font-size: 0.85rem;
          margin-top: 5px;
        }

        @media (max-width: 768px) {
          .form-card { padding: 30px; }
          .form-header h1 { font-size: 2rem; }
          .captcha-group { flex-direction: column; align-items: stretch; }
          .refresh-btn { width: 100%; }
        }
      `}} />

      <div className="rent-sell-container">
        <div className="form-card">
          <div className="form-header">
            <h1>Rent / Sell Your Property</h1>
            <p>Experience the future of real estate. Partner with Majestan Realty to showcase your property using our cutting-edge platform and unparalleled local expertise.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid-layout">
              <div className="input-group">
                <label>Name *</label>
                <input type="text" name="name" required placeholder="Your Name" value={formData.name} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Mobile Number *</label>
                <input type="tel" name="mobilenumber" required placeholder="Your Mobile Number" value={formData.mobilenumber} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Location *</label>
                <input type="text" name="location" required placeholder="Property Location" value={formData.location} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Deal Type *</label>
                <select name="dealtype" required value={formData.dealtype} onChange={handleChange}>
                  <option value="" disabled>Select Deal Type</option>
                  <option value="Rent Property">Rent Property</option>
                  <option value="Sale Property">Sale Property</option>
                  <option value="Buy Property">Buy Property</option>
                  <option value="Property Management">Property Management</option>
                  <option value="Liaisoning Service">Liaisoning Service</option>
                  <option value="Financial Assistance">Financial Assistance</option>
                  <option value="NRI">NRI</option>
                </select>
              </div>

              <div className="input-group">
                <label>Property Type *</label>
                <select name="propertyType" required value={formData.propertyType} onChange={handleChange}>
                  <option value="" disabled>Select Property Type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Plots">Plots</option>
                  <option value="Commercial Space">Commercial Space</option>
                  <option value="Industrial Space">Industrial Space</option>
                  <option value="Farmland">Farmland</option>
                </select>
              </div>

              <div className="input-group">
                <label>Size *</label>
                <input type="text" name="size" required placeholder="Property Size" value={formData.size} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Number of Rooms *</label>
                <input type="number" name="rooms" required placeholder="Number of Rooms" value={formData.rooms} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Furnishing Status *</label>
                <select name="furnishing_status" required value={formData.furnishing_status} onChange={handleChange}>
                  <option value="" disabled>Select Furnishing Status</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Un-Furnished">Un-Furnished</option>
                </select>
              </div>

              <div className="input-group">
                <label>Age of Property *</label>
                <input type="text" name="ageofproperty" required placeholder="Age of Property" value={formData.ageofproperty} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Condition *</label>
                <select name="propertyCondition" required value={formData.propertyCondition} onChange={handleChange}>
                  <option value="" disabled>Select Property Condition</option>
                  <option value="Ready to Move">Ready to Move</option>
                  <option value="Available in 1 Month">Available in 1 Month</option>
                  <option value="Un-Furnished">Un-Furnished</option>
                </select>
              </div>

              <div className="input-group">
                <label>Expected Price *</label>
                <input type="text" name="price" required placeholder="Enter Expected Price" value={formData.price} onChange={handleChange} />
              </div>

              <div className="input-group full-width">
                <label>Any Details of Property *</label>
                <input type="text" name="property_details" required placeholder="Any Detail of Property" value={formData.property_details} onChange={handleChange} />
              </div>

              <div className="input-group full-width">
                <label>Property Images</label>
                <div className="file-upload-wrapper">
                  <div className="file-upload-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    Choose File
                  </div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {formData.image ? formData.image.name : "Or drop file here to upload"}
                  </span>
                  <input type="file" className="file-input" name="image" accept="image/*" onChange={handleImageChange} />
                  {previewImage && <img src={previewImage} alt="Preview" className="preview-image" style={{ marginLeft: "auto" }} />}
                </div>
              </div>
            </div>

            <div className="captcha-group">
              <div className="captcha-question">{captchaQuestion} = ?</div>
              <input 
                type="number" 
                className="captcha-input" 
                placeholder="Enter answer" 
                value={userCaptcha}
                onChange={(e) => setUserCaptcha(e.target.value)}
                required
              />
              <button type="button" className="refresh-btn" onClick={generateCaptcha} title="Refresh Captcha">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.26l5.43 3.27"/>
                </svg>
              </button>
            </div>
            {captchaError && <div className="error-text" style={{ marginBottom: '20px', textAlign: 'center' }}>Incorrect captcha answer. Please try again.</div>}

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Submit Property"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
