import { ChangeEvent } from "react";
import Select from 'react-select';
import { 
  CountryOption, 
  RegistrationFormData, 
  organizationTypes,
  countryOptions
} from "../membershippages/types";

interface OrganizationFormProps {
  formData: RegistrationFormData;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleCountryChange: (selected: CountryOption | null, field: 'country' | 'organizationCountry') => void;
}

const OrganizationForm = ({ formData, handleInputChange, handleCountryChange }: OrganizationFormProps) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name
          </label>
          <input
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleInputChange}
            placeholder="Organization Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Type
          </label>
          <select
            name="organizationType"
            value={formData.organizationType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          >
            <option value="">Select Organization Type</option>
            {organizationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Number
          </label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleInputChange}
            placeholder="Registration Number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://www.example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Person Name
          </label>
          <input
            type="text"
            name="contactPersonName"
            value={formData.contactPersonName}
            onChange={handleInputChange}
            placeholder="Contact Person Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Person Title
          </label>
          <input
            type="text"
            name="contactPersonTitle"
            value={formData.contactPersonTitle}
            onChange={handleInputChange}
            placeholder="e.g., CEO, Director, Manager"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Email
          </label>
          <input
            type="email"
            name="organizationEmail"
            value={formData.organizationEmail}
            onChange={handleInputChange}
            placeholder="Organization Email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Phone
          </label>
          <input
            type="tel"
            name="organizationPhone"
            value={formData.organizationPhone}
            onChange={handleInputChange}
            placeholder="Organization Phone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Address
          </label>
          <input
            type="text"
            name="organizationAddress"
            value={formData.organizationAddress}
            onChange={handleInputChange}
            placeholder="Organization Address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <Select<CountryOption>
            options={countryOptions}
            value={countryOptions.find((opt) => opt.value === formData.organizationCountry)}
            onChange={(selected) => handleCountryChange(selected, 'organizationCountry')}
            placeholder="Select Country"
            className="text-left basic-multi-select"
            classNamePrefix="select"
            required
          />
        </div>
        
      </div>
    </>
  );
};

export default OrganizationForm;