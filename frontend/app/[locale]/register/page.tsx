"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import Image from "next/image";

type CountryFlagProps = {
  countryCode: string; // e.g., 'us', 'bg', 'de'
  size?: number;
};

function CountryFlag({ countryCode, size = 24 }: CountryFlagProps) {
  return (
    <Image
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      alt={`Flag of ${countryCode}`}
      width={size}
      height={size}
      className="rounded-sm"
    />
  );
}

const countryCodes = [
  { code: "+359", country: "Bulgaria", flag: "bg" },
  { code: "+44", country: "United Kingdom", flag: "gb" },
  { code: "+49", country: "Germany", flag: "de" },
  { code: "+33", country: "France", flag: "fr" },
  { code: "+39", country: "Italy", flag: "it" },
  { code: "+34", country: "Spain", flag: "es" },
  { code: "+31", country: "Netherlands", flag: "nl" },
  { code: "+32", country: "Belgium", flag: "be" },
  { code: "+41", country: "Switzerland", flag: "ch" },
  { code: "+43", country: "Austria", flag: "at" },
  { code: "+48", country: "Poland", flag: "pl" },
  { code: "+420", country: "Czech Republic", flag: "cz" },
  { code: "+36", country: "Hungary", flag: "hu" },
  { code: "+40", country: "Romania", flag: "ro" },
  { code: "+30", country: "Greece", flag: "gr" },
  { code: "+46", country: "Sweden", flag: "se" },
  { code: "+47", country: "Norway", flag: "no" },
  { code: "+45", country: "Denmark", flag: "dk" },
  { code: "+358", country: "Finland", flag: "fi" },
  { code: "+354", country: "Iceland", flag: "is" },
  { code: "+372", country: "Estonia", flag: "ee" },
  { code: "+371", country: "Latvia", flag: "lv" },
  { code: "+370", country: "Lithuania", flag: "lt" },
  { code: "+421", country: "Slovakia", flag: "sk" },
  { code: "+386", country: "Slovenia", flag: "si" },
  { code: "+385", country: "Croatia", flag: "hr" },
  { code: "+387", country: "Bosnia and Herzegovina", flag: "ba" },
  { code: "+382", country: "Montenegro", flag: "me" },
  { code: "+389", country: "North Macedonia", flag: "mk" },
  { code: "+355", country: "Albania", flag: "al" },
  { code: "+351", country: "Portugal", flag: "pt" },
  { code: "+353", country: "Ireland", flag: "ie" },
  { code: "+352", country: "Luxembourg", flag: "lu" },
  { code: "+356", country: "Malta", flag: "mt" },
  { code: "+357", country: "Cyprus", flag: "cy" },
  { code: "+350", country: "Gibraltar", flag: "gi" },
  { code: "+376", country: "Andorra", flag: "ad" },
  { code: "+378", country: "San Marino", flag: "sm" },
  { code: "+379", country: "Vatican City", flag: "va" },
  { code: "+423", country: "Liechtenstein", flag: "li" },
  { code: "+1", country: "USA/Canada", flag: "us" },
  { code: "+7", country: "Russia", flag: "ru" },
  { code: "+90", country: "Turkey", flag: "tr" },
  { code: "+380", country: "Ukraine", flag: "ua" },
  { code: "+375", country: "Belarus", flag: "by" },
  { code: "+373", country: "Moldova", flag: "md" },
  { code: "+995", country: "Georgia", flag: "ge" },
  { code: "+374", country: "Armenia", flag: "am" },
  { code: "+994", country: "Azerbaijan", flag: "az" },
];

const initialCustomer = {
  email: "", password: "", confirmPassword: "", firstName: "", lastName: "", 
  phoneCountryCode: "+359", phoneNumber: "",
  // Delivery address fields
  deliveryCountry: "", deliveryPostalCode: "", deliveryCity: "", deliveryAddress: "",
  // Invoice address fields
  invoiceCountry: "", invoicePostalCode: "", invoiceCity: "", invoiceAddress: "",
  // Company fields
  companyName: "", eik: "", bulstat: "", mol: "", companyWebsite: "", companyActivity: "", 
  // Other
  agree: false, sameAsInvoice: false,
};

export default function RegisterPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [form, setForm] = useState(initialCustomer);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAgency = userType === "agency";
  const isCustomer = userType === "customer";

  const selectedCountry = countryCodes.find(c => c.code === form.phoneCountryCode) || countryCodes[0];

  // Ensure client-side only rendering for params
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCountrySelect = (countryCode: string) => {
    setForm(f => ({ ...f, phoneCountryCode: countryCode }));
    setShowCountryDropdown(false);
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSameAsInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setForm(f => ({ 
      ...f, 
      sameAsInvoice: checked,
      deliveryCountry: checked ? f.invoiceCountry : f.deliveryCountry,
      deliveryPostalCode: checked ? f.invoicePostalCode : f.deliveryPostalCode,
      deliveryCity: checked ? f.invoiceCity : f.deliveryCity,
      deliveryAddress: checked ? f.invoiceAddress : f.deliveryAddress,
    }));
  };

  const validate = () => {
    if (!userType) return t("userTypeSelect");
    if (!form.email || !form.password || !form.confirmPassword) return t("required");
    if (form.password !== form.confirmPassword) return t("passwordsDontMatch");
    if (!form.firstName || !form.lastName || !form.phoneNumber) return t("fillAllRequired");
    if (!form.agree) return t("mustAgree");
    // Temporarily disable reCAPTCHA validation for testing
    // if (!recaptchaToken) return t("recaptchaRequired");
    
    // Validate delivery address
    if (!form.deliveryCountry || !form.deliveryPostalCode || !form.deliveryCity || !form.deliveryAddress) {
      return t("fillDeliveryAddress");
    }
    
    if (isAgency) {
      // Validate invoice address
      if (!form.invoiceCountry || !form.invoicePostalCode || !form.invoiceCity || !form.invoiceAddress) {
        return t("fillInvoiceAddress");
      }
      // Validate company fields
      if (!form.companyName || !form.eik || !form.bulstat || !form.mol || !form.companyWebsite || !form.companyActivity) {
        return t("fillCompanyFields");
      }
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          userType,
          locale,
          recaptchaToken
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        // Reset form after successful registration
        setForm(initialCustomer);
        setUserType(null);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-white font-sans py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-100">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const locale = params?.locale as string || 'bg';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-white font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{t("registerTitle")}</h2>
          <p className="text-center text-gray-500">{t("registerSubtitle")}</p>
        </div>
        
        {!userType && (
          <div className="flex flex-col items-center space-y-4">
            <button
              className="w-full py-4 px-6 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => setUserType("customer")}
            >
              {t("endCustomer")}
            </button>
            <button
              className="w-full py-4 px-6 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-600 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => setUserType("agency")}
            >
              {t("agency")}
            </button>
          </div>
        )}
        
        {userType && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("firstName")} <span className="text-primary">*</span>
                </label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={form.firstName} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("lastName")} <span className="text-primary">*</span>
                </label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={form.lastName} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("phone")} <span className="text-primary">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative w-24 sm:w-32 z-10">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="w-full rounded-lg border border-gray-300 bg-blue-50 px-2 sm:px-3 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1 sm:gap-2">
                        <CountryFlag countryCode={selectedCountry.flag} size={16} />
                        <span className="text-xs sm:text-sm font-medium">{selectedCountry.code}</span>
                      </span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showCountryDropdown && (
                      <div 
                        ref={dropdownRef}
                        className="absolute z-[9999] w-max mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto top-full left-0"
                      >
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country.code)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <CountryFlag countryCode={country.flag} size={20} />
                            <span className="text-sm font-medium">{country.code}</span>
                            <span className="text-xs text-gray-500 ml-auto">{country.flag.toUpperCase()}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    value={form.phoneNumber} 
                    onChange={handleChange} 
                    className="flex-1 rounded-lg border border-gray-300 bg-blue-50 px-3 sm:px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition text-sm sm:text-base" 
                    placeholder={t("phoneNumber")}
                    required 
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("email")} <span className="text-primary">*</span>
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("password")} <span className="text-primary">*</span>
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("confirmPassword")} <span className="text-primary">*</span>
                </label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={form.confirmPassword} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                  required 
                />
              </div>
              
              {isAgency && (
                <>
                  <div className="md:col-span-2 border-t pt-6 mt-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-4">{t("companyInfo")}</h3>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("companyName")} <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="companyName" 
                      value={form.companyName} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                      required={isAgency} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("eik")} <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="eik" 
                      value={form.eik} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                      required={isAgency} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("bulstat")} <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="bulstat" 
                      value={form.bulstat} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                      required={isAgency} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("mol")} <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="mol" 
                      value={form.mol} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                      required={isAgency} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("companyWebsite")} <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="companyWebsite" 
                      value={form.companyWebsite} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                      required={isAgency} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("companyActivity")} <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="companyActivity" 
                      value={form.companyActivity} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                      required={isAgency} 
                    />
                  </div>
                  
                  {/* Invoice Address Section */}
                  <div className="md:col-span-2 border-t pt-6 mt-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-4">{t("invoiceInfo")}</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("invoiceCountry")} <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="invoiceCountry" 
                      value={form.invoiceCountry} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                      required={isAgency} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("invoicePostalCode")} <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="invoicePostalCode" 
                      value={form.invoicePostalCode} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                      required={isAgency} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("invoiceCity")} <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="invoiceCity" 
                      value={form.invoiceCity} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                      required={isAgency} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("invoiceAddress")} <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="invoiceAddress" 
                      value={form.invoiceAddress} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                      required={isAgency} 
                    />
                  </div>
                </>
              )}
              
              {/* Delivery Information Section */}
              <div className="md:col-span-2 border-t pt-6 mt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h3 className="font-bold text-xl text-gray-800">{t("deliveryInfo")}</h3>
                  {isAgency && (
                    <div className="flex items-center mt-2 md:mt-0">
                      <input 
                        id="sameAsInvoice" 
                        name="sameAsInvoice" 
                        type="checkbox" 
                        checked={form.sameAsInvoice} 
                        onChange={handleSameAsInvoiceChange} 
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded" 
                      />
                      <label htmlFor="sameAsInvoice" className="ml-3 block text-sm text-gray-900">
                        {t("sameAsInvoice")}
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("deliveryCountry")} <span className="text-primary">*</span>
                </label>
                <input 
                  type="text" 
                  name="deliveryCountry" 
                  value={form.deliveryCountry} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                  required 
                  disabled={isAgency && form.sameAsInvoice}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("deliveryPostalCode")} <span className="text-primary">*</span>
                </label>
                <input 
                  type="text" 
                  name="deliveryPostalCode" 
                  value={form.deliveryPostalCode} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                  required 
                  disabled={isAgency && form.sameAsInvoice}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("deliveryCity")} <span className="text-primary">*</span>
                </label>
                <input 
                  type="text" 
                  name="deliveryCity" 
                  value={form.deliveryCity} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                  required 
                  disabled={isAgency && form.sameAsInvoice}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("deliveryAddress")} <span className="text-primary">*</span>
                </label>
                <input 
                  type="text" 
                  name="deliveryAddress" 
                  value={form.deliveryAddress} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition" 
                  required 
                  disabled={isAgency && form.sameAsInvoice}
                />
              </div>
            </div>
            
            {/* reCAPTCHA - Temporarily disabled for testing */}
            {/* <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key - replace with your actual key
                onChange={handleRecaptchaChange}
                theme="light"
                size="normal"
              />
            </div> */}
            
            <div className="flex items-center mt-6">
              <input 
                id="agree" 
                name="agree" 
                type="checkbox" 
                checked={form.agree} 
                onChange={handleChange} 
                className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded" 
                required 
              />
              <label htmlFor="agree" className="ml-3 block text-sm text-gray-900">
                {t("agree")} <a href="#" className="text-primary hover:underline font-semibold">{t("terms")}</a> {t("and")} <a href="#" className="text-primary hover:underline font-semibold">{t("privacy")}</a>.
              </label>
            </div>
            
            {error && <div className="text-red-500 text-sm text-center font-semibold bg-red-50 p-3 rounded-lg">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center font-semibold bg-green-50 p-3 rounded-lg">{success}</div>}
            
            <div className="flex items-center justify-between">
              <button 
                type="button" 
                className="text-sm text-gray-500 hover:text-primary transition" 
                onClick={() => setUserType(null)}
              >
                ← {t("backToSelection")}
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-8 py-3 rounded-lg bg-primary text-white font-bold shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50"
              >
                {loading ? t("registering") : t("register")}
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              {t("haveAccount")} <Link href={`/${locale}/login`} className="text-primary font-semibold hover:underline">
                {t("toLogin")}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 