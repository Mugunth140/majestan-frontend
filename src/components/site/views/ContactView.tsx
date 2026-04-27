"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  captchaInput: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormState, string>>;

type SweetAlertWindow = Window & {
  Swal?: {
    fire: (options: {
      icon: "success" | "error" | "info" | "warning";
      title: string;
      text: string;
      confirmButtonColor: string;
    }) => Promise<unknown>;
  };
};

const CAPTCHA_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateCaptcha = (length = 6): string => {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return value;
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  interest: "",
  message: "",
  captchaInput: "",
};

export function ContactView(): React.JSX.Element {
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({});
  const [captcha, setCaptcha] = useState<string>(generateCaptcha());
  const [captchaError, setCaptchaError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 26px "Lexend", sans-serif';
    context.fillStyle = "#fff";
    context.textBaseline = "middle";
    context.fillText(captcha, 25, 15);
  }, [captcha]);

  const setField = <K extends keyof ContactFormState>(field: K, value: ContactFormState[K]): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setFormErrors((previous) => ({ ...previous, [field]: "" }));

    if (field === "captchaInput") {
      setCaptchaError("");
    }
  };

  const validateForm = (): ContactFormErrors => {
    const errors: ContactFormErrors = {};

    if (!form.name.trim()) {
      errors.name = "Please enter your name.";
    }

    if (!form.phone.trim()) {
      errors.phone = "Please enter your phone number.";
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      errors.phone = "Phone number must be exactly 10 digits.";
    }

    if (!form.email.trim()) {
      errors.email = "Please enter your email.";
    } else if (!isValidEmail(form.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!form.interest) {
      errors.interest = "Please select an interest.";
    }

    if (!form.message.trim()) {
      errors.message = "Please enter your message.";
    }

    return errors;
  };

  const showAlert = async (
    icon: "success" | "error" | "info" | "warning",
    title: string,
    text: string,
    confirmButtonColor: string,
  ): Promise<void> => {
    const swalWindow = window as SweetAlertWindow;
    if (swalWindow.Swal?.fire) {
      await swalWindow.Swal.fire({
        icon,
        title,
        text,
        confirmButtonColor,
      });
      return;
    }

    window.alert(text);
  };

  const refreshCaptcha = (): void => {
    setCaptcha(generateCaptcha());
    setField("captchaInput", "");
    setCaptchaError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (form.captchaInput.trim() !== captcha) {
      setCaptchaError("Captcha doesn't match");
      setCaptcha(generateCaptcha());
      return;
    }

    setSubmitting(true);

    try {
      const payload = new URLSearchParams({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        interest: form.interest,
        message: form.message.trim(),
      });

      const response = await fetch("/Home/sendContactMail", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: payload.toString(),
      });

      const responseText = (await response.text()).trim().toLowerCase();

      if (response.ok && responseText === "success") {
        await showAlert(
          "success",
          "Success",
          "Enquiry Submitted Successfully. Our team will contact you soon!",
          "#28a745",
        );
        setForm(initialFormState);
        setFormErrors({});
        setCaptcha(generateCaptcha());
      } else {
        await showAlert(
          "error",
          "Error",
          "Something went wrong. Please try again!",
          "#d33",
        );
      }
    } catch {
      await showAlert("error", "Error", "Server error! Please try again later.", "#d33");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @media (max-width: 767px) {
          .mapframe iframe {
            width: 344px !important;
            height: 368px !important;
            padding-right: 10px !important;
          }

          .mapframe {
            margin-top: 20px;
          }

          .section-contact .list-info li .icon {
            position: relative;
            max-width: 35px;
            margin-left: 4px;
          }

          .section-contact .list-info li .phone {
            font-size: 20px;
            line-height: 30.5px;
          }
        }

        #captchaCanvas1 {
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 3px;
          padding: 6px 12px;
          border-radius: 5px;
          background-image: url('/assets/images/bg/captcha.png');
          color: #fff;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        #captchaError1 {
          color: red;
          display: block;
          font-size: 13px;
          min-height: 18px;
          margin-top: 6px;
        }

        #refreshCaptcha1 {
          height: 27px;
          width: 27px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #27427f;
          border: 1px solid #27427f;
        }

        #refreshCaptcha1:hover {
          background-color: #27427f;
          color: #fff;
        }

        .contact-error {
          color: #d33;
          font-size: 13px;
          margin-top: 6px;
        }
      `}</style>

      <section className="section-top-map mt-48 style-1">
        <div className="box">
          <div className="tf-container">
            <div className="row">
              <div className="col-md-4">
                <div className="image-wrap">
                  <img
                    className="lazyload"
                    data-src="/assets/images/section/contact1.png"
                    src="/assets/images/section/contact1.png"
                    alt="Contact Majestan Realty"
                  />
                </div>
              </div>

              <div className="col-md-8">
                <form id="contactform" className="form-contact" onSubmit={handleSubmit}>
                  <div className="heading-section">
                    <h2 className="title">Your Goals Matter - Let&apos;s Make Them Happen.</h2>
                    <p className="text-1">
                      Guiding you in every step, whether you buy, sell, rent, or lease.
                    </p>
                  </div>

                  <div className="cols">
                    <fieldset>
                      <label htmlFor="name">Name:</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your name"
                        name="name"
                        id="name"
                        value={form.name}
                        onChange={(event) => setField("name", event.target.value)}
                        required
                      />
                      {formErrors.name ? <div className="contact-error">{formErrors.name}</div> : null}
                    </fieldset>

                    <fieldset>
                      <label htmlFor="email-contact">Email:</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        name="email"
                        id="email-contact"
                        value={form.email}
                        onChange={(event) => setField("email", event.target.value)}
                        required
                      />
                      {formErrors.email ? <div className="contact-error">{formErrors.email}</div> : null}
                    </fieldset>
                  </div>

                  <div className="cols">
                    <fieldset className="phone">
                      <label htmlFor="phone">Phone number:</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your phone number"
                        name="phone"
                        id="phone"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phone}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
                          setField("phone", digits);
                        }}
                        required
                      />
                      {formErrors.phone ? <div className="contact-error">{formErrors.phone}</div> : null}
                    </fieldset>

                    <div className="select">
                      <label className="text-1 fw-6 mb-12" htmlFor="interest">
                        What are you interested in?
                      </label>
                      <select
                        className="form-control"
                        id="interest"
                        name="interest"
                        value={form.interest}
                        onChange={(event) => setField("interest", event.target.value)}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Rent">Rent</option>
                        <option value="Sale">Sale</option>
                      </select>
                      {formErrors.interest ? (
                        <div className="contact-error">{formErrors.interest}</div>
                      ) : null}
                    </div>
                  </div>

                  <fieldset>
                    <label htmlFor="message">Your Message:</label>
                    <textarea
                      name="message"
                      cols={30}
                      rows={10}
                      placeholder="Message"
                      id="message"
                      value={form.message}
                      onChange={(event) => setField("message", event.target.value)}
                      required
                    />
                    {formErrors.message ? (
                      <div className="contact-error">{formErrors.message}</div>
                    ) : null}
                  </fieldset>

                  <fieldset className="mb-4">
                    <div className="d-flex">
                      <div className="d-flex align-items-center mb-2">
                        <canvas id="captchaCanvas1" ref={canvasRef} width={160} height={30} />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary ms-2"
                          id="refreshCaptcha1"
                          onClick={refreshCaptcha}
                          aria-label="Refresh captcha"
                        >
                          <i className="fa-solid fa-rotate-right" />
                        </button>
                      </div>

                      <div className="ms-5 w-50">
                        <input
                          type="text"
                          className="form-control"
                          id="captchaInput1"
                          placeholder="Enter CAPTCHA"
                          value={form.captchaInput}
                          onChange={(event) => setField("captchaInput", event.target.value)}
                        />
                        <div id="captchaError1">{captchaError}</div>
                      </div>
                    </div>
                  </fieldset>

                  <div className="send-wrap">
                    <button
                      className="tf-btn contact-form bg-color-primary fw-7 pd-8"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : "Contact our experts"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-contact tf-spacing-1">
        <div className="tf-container">
          <div className="row">
            <div className="col-md-6">
              <div className="box-contact">
                <div className="heading-section mb-48">
                  <h2 className="title">Delivering the finest and most reliable real estate solutions.</h2>
                  <p className="text-1">
                    Connecting you with the right property solutions, every step of the way.
                  </p>
                </div>

                <ul className="list-info">
                  <li>
                    <div className="icon">
                      <img src="/assets/images/icons/map.png" alt="Address" />
                    </div>
                    <div className="content">
                      <div className="sub">Address</div>
                      <p>
                        47/1 Aandal Street,
                        <br />
                        Lakshmipuram Main Rd, Hope College,
                        <br />
                        Coimbatore, Tamil Nadu 641004.
                      </p>
                    </div>
                  </li>

                  <li>
                    <div className="icon">
                      <img src="/assets/images/icons/phone.png" alt="Phone" />
                    </div>
                    <div className="content">
                      <div className="sub">Contact</div>
                      <div className="phone">+91 90929 65556</div>
                    </div>
                  </li>

                  <li>
                    <div className="icon">
                      <img src="/assets/images/icons/email.png" alt="Email" />
                    </div>
                    <div className="content">
                      <div className="sub">Mail</div>
                      <a href="mailto:info@majestanrealty.com">info@majestanrealty.com</a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-md-6 col-sm-12 mapframe">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d238.70771719598824!2d77.0214589797525!3d11.02295130784673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTHCsDAxJzIyLjkiTiA3N8KwMDEnMTcuNCJF!5e1!3m2!1sen!2sin!4v1741427284311!5m2!1sen!2sin"
                width="600"
                height="600"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Majestan Realty location"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
