import React, { useState } from "react";
import {
  FaUser,
  FaBirthdayCake,
  FaFlag,
  FaBook,
  FaIdCard,
  FaUserFriends,
  FaPhone,
  FaEnvelope,
  FaImage,
  FaSave,
  FaRedo,
  FaMars,
  FaVenus,
  FaGenderless,
  FaChevronDown,
} from "react-icons/fa";

const StudentAdmission = () => {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    religion: "",
    nationality: "",
    studentId: "",
    level: "",
    section: "",
    course: "",
    parentName: "",
    parentContact: "",
    email: "",
    phone: "",
    studentPhoto: null,
  });

  /* ---------------- OPTIONS ---------------- */
  const genderOptions = [
    { value: "male", label: "Male", icon: <FaMars /> },
    { value: "female", label: "Female", icon: <FaVenus /> },
    { value: "other", label: "Other", icon: <FaGenderless /> },
  ];

  const religionOptions = ["Christianity", "Islam", "Traditional"];
  const nationalityOptions = ["Ghanaian", "Nigerian", "Ivorian"];
  const levelOptions = ["JHS 1", "JHS 2", "JHS 3"];
  const sectionOptions = ["A", "B", "C"];
  const courseOptions = ["General", "Science", "Arts"];

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "studentPhoto" && files[0]) {
      setFormData({ ...formData, studentPhoto: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
      return;
    }

    if (name === "dateOfBirth") {
      const birthYear = new Date(value).getFullYear();
      const age = new Date().getFullYear() - birthYear;
      setFormData({ ...formData, dateOfBirth: value, age });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log("Submitted Data:", formData);
      alert("Student admitted successfully!");
      setLoading(false);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      dateOfBirth: "",
      age: "",
      religion: "",
      nationality: "",
      studentId: "",
      level: "",
      section: "",
      course: "",
      parentName: "",
      parentContact: "",
      email: "",
      phone: "",
      studentPhoto: null,
    });
    setPreviewImage(null);
  };

  /* ---------------- STYLES ---------------- */
  const input =
    "w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#052954]/30 focus:border-[#052954] outline-none transition";

  const select =
    "appearance-none w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#052954]/30 focus:border-[#052954] outline-none cursor-pointer";

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-4 md:p-8">

      {/* ===== HEADER ===== */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#052954]">
          Student Admission Form
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete all required fields to admit a new student
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* ===== PERSONAL INFO ===== */}
        <Section title="Personal Information" icon={<FaUser />}>
          <input name="firstName" placeholder="First Name *" required className={input} onChange={handleChange} />
          <input name="lastName" placeholder="Last Name *" required className={input} onChange={handleChange} />

          <div className="col-span-2 flex gap-2">
            {genderOptions.map(g => (
              <label key={g.value}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition
                ${formData.gender === g.value ? "bg-[#052954] text-white" : "hover:bg-[#052954]/5"}`}>
                <input type="radio" name="gender" value={g.value} hidden onChange={handleChange} />
                {g.icon} {g.label}
              </label>
            ))}
          </div>

          <input type="date" name="dateOfBirth" className={input} onChange={handleChange} />
          <input readOnly value={formData.age} placeholder="Age" className={`${input} bg-gray-100`} />

          <Select name="religion" label="Religion *" options={religionOptions} onChange={handleChange} />
          <Select name="nationality" label="Nationality *" options={nationalityOptions} onChange={handleChange} />
        </Section>

        {/* ===== ACADEMIC INFO ===== */}
        <Section title="Academic Information" icon={<FaBook />}>
          <input name="studentId" placeholder="Student ID *" required className={input} onChange={handleChange} />
          <Select name="level" label="Level *" options={levelOptions} onChange={handleChange} />
          <Select name="section" label="Section *" options={sectionOptions} onChange={handleChange} />
          <Select name="course" label="Course *" options={courseOptions} onChange={handleChange} />
        </Section>

        {/* ===== PARENT INFO ===== */}
        <Section title="Parent / Guardian Information" icon={<FaUserFriends />}>
          <input name="parentName" placeholder="Parent/Guardian Name *" required className={input} onChange={handleChange} />
          <input name="parentContact" placeholder="Parent Contact *" required className={input} onChange={handleChange} />
        </Section>

        {/* ===== CONTACT INFO ===== */}
        <Section title="Contact Information" icon={<FaEnvelope />}>
          <input type="email" name="email" placeholder="Email Address *" required className={input} onChange={handleChange} />
          <input name="phone" placeholder="Phone Number *" required className={input} onChange={handleChange} />
        </Section>

        {/* ===== PHOTO ===== */}
        <Section title="Student Photo" icon={<FaImage />}>
          <div className="col-span-2 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-6xl text-gray-400" />
              )}
            </div>

            <label className="cursor-pointer bg-[#052954] text-white px-6 py-3 rounded-xl">
              Upload Photo
              <input type="file" hidden name="studentPhoto" accept="image/*" onChange={handleChange} />
            </label>
          </div>
        </Section>

        {/* ===== ACTIONS ===== */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#ffa301] text-[#052954] py-4 rounded-xl font-semibold flex justify-center gap-2"
          >
            <FaSave /> {loading ? "Saving..." : "Complete Admission"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex-1 border border-[#052954] text-[#052954] py-4 rounded-xl flex justify-center gap-2"
          >
            <FaRedo /> Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

/* ===== REUSABLE COMPONENTS ===== */

const Section = ({ title, icon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-4 text-[#052954] font-semibold">
      {icon} {title}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {children}
    </div>
  </div>
);

const Select = ({ name, label, options, onChange }) => (
  <div className="relative">
    <select name={name} onChange={onChange} className="appearance-none w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#052954]/30 focus:border-[#052954] outline-none">
      <option value="">{label}</option>
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

export default StudentAdmission;
