import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Clock, Upload, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScrollIndicator } from '../components/ui/ScrollIndicator';
import { JobDepartmentSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { API_ENDPOINTS } from '../config/api';
import { AnimatedElement } from '../components/ui/AnimatedElement';

interface JobVacancy {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string | null;
  requirements: string | null;
  application_link: string | null;
  status: string;
}

interface ApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  linkedin: string;
  expertise: string;
  cv: File | null;
  message: string;
  agreeToPrivacy: boolean;
}

export const Careers: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [openPositions, setOpenPositions] = useState<JobVacancy[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    linkedin: '',
    expertise: 'Sales',
    cv: null,
    message: '',
    agreeToPrivacy: false,
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CAREERS.BASE);
        setOpenPositions(response.data);
      } catch (error) {
        console.error('Error fetching job vacancies:', error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        cv: e.target.files![0],
      }));
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('linkedin', formData.linkedin);
      formDataToSend.append('expertise', formData.expertise);
      formDataToSend.append('message', formData.message);
      if (formData.cv) {
        formDataToSend.append('cv', formData.cv);
      }

      await axios.post(API_ENDPOINTS.CAREERS.APPLY, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitSuccess(true);
      toast.success(t('careers.form.success', "Your application has been submitted successfully! We'll be in touch soon."));
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        linkedin: '',
        expertise: 'Sales',
        cv: null,
        message: '',
        agreeToPrivacy: false,
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitError('Failed to submit application. Please try again.');
      toast.error(t('careers.form.error', 'Failed to submit application. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] pt-32 pb-20 md:pt-40 md:pb-28 flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement animation="fade-up" speed="slow" className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('careers.hero.title', "We're hiring!")}
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              {t('careers.hero.subtitle', "We're looking for talented people")}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('careers.hero.description', "Our philosophy is simple — hire a team of diverse, passionate people and foster a culture that empowers you to do your best work.")}
            </p>
          </AnimatedElement>
        </div>
        <ScrollIndicator />
      </section>

      {/* Open Positions Section */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 text-shadow-sm">
              {t('careers.positions.title', 'Open Positions')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('careers.positions.subtitle', 'Find your next opportunity')}
            </p>
          </AnimatedElement>

          {loadingJobs ? (
            <div className="space-y-8">
              <JobDepartmentSkeleton jobs={2} />
              <JobDepartmentSkeleton jobs={3} />
            </div>
          ) : openPositions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('careers.positions.emptyTitle', 'No Open Positions')}
              </h3>
              <p className="text-lg text-text-secondary">{t('careers.positions.empty', 'No open positions at the moment. Check back soon!')}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Group positions by department */}
              {Object.entries(
                openPositions.reduce((acc, position) => {
                  const dept = position.department || 'Other';
                  if (!acc[dept]) acc[dept] = [];
                  acc[dept].push(position);
                  return acc;
                }, {} as Record<string, JobVacancy[]>)
              ).sort(([deptA], [deptB]) => {
                // Define department order with Sales first
                const order = ['Sales', 'Marketing', 'Customer Success', 'Finance', 'Operations', 'Engineering', 'Product', 'Design'];
                const indexA = order.indexOf(deptA);
                const indexB = order.indexOf(deptB);
                // If department not in order list, put it at the end
                if (indexA === -1 && indexB === -1) return deptA.localeCompare(deptB);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
              }).map(([department, positions], deptIndex) => (
                <AnimatedElement
                  key={department}
                  animation="fade-up"
                  delay={deptIndex * 100}
                  scrollTrigger
                  once
                  className="bg-background-alt rounded-2xl p-6 md:p-8"
                >
                  {/* Department Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-text-primary">
                      {department}
                    </h3>
                    <p className="text-sm text-text-secondary mt-2">
                      {positions.length} {positions.length === 1 ? t('careers.positions.availableSingular', 'position available') : t('careers.positions.available', 'positions available')}
                    </p>
                  </div>

                  {/* Department Positions */}
                  <div className="space-y-4">
                    {positions.map((position, index) => (
                      <AnimatedElement
                        key={position.id}
                        animation="fade-right"
                        speed="fast"
                        delay={index * 50}
                        scrollTrigger
                        once
                      >
                        <Card
                          className={`hover:shadow-2xl transition-shadow shadow-lg ${position.application_link ? 'cursor-pointer' : ''}`}
                          onClick={() => position.application_link && window.open(position.application_link, '_blank')}
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-text-primary mb-2 hover:text-primary transition-colors">
                                  {position.title}
                                </h4>
                                <div className="flex flex-wrap gap-3 text-sm text-text-secondary mb-3">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {position.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {position.type}
                                  </span>
                                </div>
                                {position.description && (
                                  <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                                    {position.description}
                                  </p>
                                )}
                              </div>
                              {position.application_link && (
                                <Button
                                  variant="primary"
                                  className="whitespace-nowrap shrink-0"
                                  onClick={(e) => {
                                    e?.stopPropagation();
                                    window.open(position.application_link!, '_blank');
                                  }}
                                >
                                  {t('careers.apply', 'Apply Now')}
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      </AnimatedElement>
                    ))}
                  </div>
                </AnimatedElement>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* General Application Form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement
            animation="fade-up"
            scrollTrigger
            once
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
              {t('careers.form.title', "Didn't find the perfect role?")}
            </h2>
            <h3 className="text-xl font-semibold text-primary mb-3">
              {t('careers.form.subtitle', "Let's stay connected!")}
            </h3>
            <p className="text-text-secondary leading-relaxed max-w-2xl mx-auto">
              {t('careers.form.description', "We may not have an open position that fits your skills right now, but we're always eager to connect with talented individuals for future opportunities. Share your application with us, and let's keep the conversation going for what's next!")}
            </p>
          </AnimatedElement>

          <AnimatedElement
            animation="fade-up"
            delay={200}
            scrollTrigger
            once
          >
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('careers.form.firstName', 'First name')}
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder={t('careers.form.firstName', 'First name')}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('careers.form.lastName', 'Last name')}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder={t('careers.form.lastName', 'Last name')}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('careers.form.email', 'Email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@company.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('careers.form.phone', 'Phone number')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('careers.form.address', 'Address')}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={t('careers.form.address', 'Address')}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* City and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('careers.form.city', 'City')}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder={t('careers.form.city', 'City')}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('careers.form.country', 'Country')}
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder={t('careers.form.country', 'Country')}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('careers.form.linkedin', 'LinkedIn Profile')}
            </label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleInputChange}
              placeholder={t('careers.form.linkedin', 'LinkedIn Profile')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('careers.form.expertise', "What's your area of expertise?")}
            </label>
            <select
              name="expertise"
              value={formData.expertise}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Sales">{t('careers.form.expertiseOptions.sales', 'Sales')}</option>
              <option value="Engineering">{t('careers.form.expertiseOptions.engineering', 'Engineering')}</option>
              <option value="Operations">{t('careers.form.expertiseOptions.operations', 'Operations')}</option>
              <option value="Customer success">{t('careers.form.expertiseOptions.customerSuccess', 'Customer success')}</option>
              <option value="Other">{t('careers.form.expertiseOptions.other', 'Other')}</option>
            </select>
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('careers.form.cv', 'Attach your CV')}
            </label>
            <div className="relative">
              <input
                type="file"
                name="cv"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                required
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors flex items-center justify-center gap-2 text-text-secondary hover:text-primary"
              >
                <Upload className="w-5 h-5" />
                <span>{formData.cv ? formData.cv.name : t('careers.form.uploadCv', 'Upload Your CV')}</span>
              </label>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('careers.form.message', 'What role would you like to apply to?')}
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={t('careers.form.messagePlaceholder', 'Type your message...')}
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Privacy Agreement */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agreeToPrivacy"
              checked={formData.agreeToPrivacy}
              onChange={handleInputChange}
              required
              className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              id="privacy-checkbox"
            />
            <label htmlFor="privacy-checkbox" className="text-sm text-text-secondary">
              {t('careers.form.privacy', 'You agree to our friendly privacy policy.')}
            </label>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {t('careers.form.error', 'Failed to submit application. Please try again.')}
            </div>
          )}

          {/* Success Message */}
          {submitSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {t('careers.form.success', "Your application has been submitted successfully! We'll be in touch soon.")}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button type="submit" variant="primary" size="lg" disabled={submitting}>
              {submitting ? t('careers.form.submitting', 'Submitting...') : t('careers.form.submit', 'Submit Application')}
            </Button>
          </div>
        </form>
            </Card>
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
};
