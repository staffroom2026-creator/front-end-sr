import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import { apiErrorMessage, API_ORIGIN } from "../services/api";
import { jobService } from "../services/jobService";
import { applicationService } from "../services/applicationService";
import { featureService } from "../services/featureService";
import { profileService } from "../services/profileService";
import BrandLogo from "../components/BrandLogo";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArchive,
  FiArrowLeft,
  FiArrowRight,
  FiBell,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiBookOpen,
  FiChevronDown,
  FiClock,
  FiDollarSign,
  FiEdit,
  FiFileText,
  FiGrid,
  FiHome,
  FiInfo,
  FiLink,
  FiList,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiMessageSquare,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiSettings,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
  FiBook,
  FiAward,
  FiEye,
  FiDownload,
} from "react-icons/fi";

const emptyJobForm = {
  title: "",
  description: "",
  responsibilities: [],
  role_type: "",
  employment_type: "full-time",
  salary_range: "",
  location: "",
  requirements: "",
  teaching_level: "SS1 – SS3 (Senior Secondary)",
  required_experience: "5+ years",
  required_qualification: "B.Ed or equivalent",
  application_deadline: "",
  is_featured: false,
};

const normalizeResponsibilityList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return normalizeResponsibilityList(parsed);
  } catch {
    // Parse legacy delimited requirements below.
  }

  return value
    .split(/[;|\n•]+/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
};





export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({});
  const [verifications, setVerifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [previousTab, setPreviousTab] = useState("overview");
  const [settingsSection, setSettingsSection] = useState("overview");
  const [snackbar, setSnackbar] = useState(null);
  const [isSnackbarClosing, setIsSnackbarClosing] = useState(false);
  const [jobFilter, setJobFilter] = useState("All Jobs");
  const [openJobMenuId, setOpenJobMenuId] = useState(null);
  const [openApplicantMenuId, setOpenApplicantMenuId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailView, setJobDetailView] = useState("detail");
  const [applicantFilter, setApplicantFilter] = useState("All");
  const [applicantPage, setApplicantPage] = useState(1);
  const [, setCurrentTime] = useState(() => Date.now());
  const [experienceFilter, setExperienceFilter] = useState("Experience");
  const [qualificationFilter, setQualificationFilter] = useState("Qualification");
  const [experienceMenuOpen, setExperienceMenuOpen] = useState(false);
  const [qualificationMenuOpen, setQualificationMenuOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState(null);
  const [teacherInviteMessage, setTeacherInviteMessage] = useState(
    "Hi there, we were impressed by your profile and would love for you to apply for one of our open teaching opportunities. We would be delighted to discuss the role with you and learn more about your experience.",
  );
  const [teacherInviteSubmitting, setTeacherInviteSubmitting] = useState(false);
  const [savedTeacherIds, setSavedTeacherIds] = useState([]);
  const [schoolLogoPreview, setSchoolLogoPreview] = useState("");
  const [schoolLocationLocked, setSchoolLocationLocked] = useState(false);
  const [isSchoolNameEditing, setIsSchoolNameEditing] = useState(false);
  const [schoolNameValue, setSchoolNameValue] = useState("");
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [isPhoneEditing, setIsPhoneEditing] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [isWebsiteEditing, setIsWebsiteEditing] = useState(false);
  const [websiteValue, setWebsiteValue] = useState("");
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [addressValue, setAddressValue] = useState("");
  const [savingSchoolProfile, setSavingSchoolProfile] = useState(false);
  const schoolLogoInputRef = useRef(null);
  const schoolNameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const websiteInputRef = useRef(null);
  const addressTextareaRef = useRef(null);
  const [notificationItems, setNotificationItems] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationActionLoading, setNotificationActionLoading] = useState({});
  const [visibleSchoolNotificationCount, setVisibleSchoolNotificationCount] = useState(10);
  const [visibleTeacherCount, setVisibleTeacherCount] = useState(10);
  const [visibleSchoolJobCount, setVisibleSchoolJobCount] = useState(10);
  const [schoolProfile, setSchoolProfile] = useState({});
  const [editingJobId, setEditingJobId] = useState(null);
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
  const [isShortlistSuccessOpen, setIsShortlistSuccessOpen] = useState(false);
  const [shortlistSubmitting, setShortlistSubmitting] = useState(false);
  const [shortlistError, setShortlistError] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState("");
  const [isTeacherInviteModalOpen, setIsTeacherInviteModalOpen] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherSearchSubmitted, setTeacherSearchSubmitted] = useState("");
  const [teacherLocation, setTeacherLocation] = useState("All Locations");
  const [teacherLocationMenuOpen, setTeacherLocationMenuOpen] = useState(false);
  const [teacherExperience, setTeacherExperience] = useState("Experience");
  const [teacherExperienceMenuOpen, setTeacherExperienceMenuOpen] =
    useState(false);
  const [teacherSubject, setTeacherSubject] = useState("Subject");
  const [teacherSubjectMenuOpen, setTeacherSubjectMenuOpen] = useState(false);
  const [teacherTrcn, setTeacherTrcn] = useState("TRCN");
  const [teacherTrcnMenuOpen, setTeacherTrcnMenuOpen] = useState(false);
  const [shortlistForm, setShortlistForm] = useState({
    interviewType: "",
    responseTemplate: "",
    candidateMessage: "Dear Candidate,\n\nYou have been shortlisted for the next stage of the selection process. Please review the interview details and respond at your earliest convenience.\n\nKind regards,\nStaffroom Team",
    saveTemplate: true,
    interviewDate: "",
    interviewTime: "",
    interviewVenue: "",
    interviewLink: "",
    recipientName: "",
    recipientPhone: "",
  });

  const toAssetUrl = (assetPath) => {
    if (!assetPath) return "";
    if (/^(data:|https?:\/\/)/i.test(assetPath)) return assetPath;
    return `${API_ORIGIN}/${String(assetPath).replace(/^\/+/, "")}`;
  };
  const normalizedUserRole = String(user?.role || user?.user_role || user?.role_name || "").toLowerCase();
  const isSchool = normalizedUserRole === "school" || normalizedUserRole === "school_admin";

  const extractApiList = (response, keys = []) => {
    const payload = response?.data?.data ?? response?.data ?? response ?? {};
    if (Array.isArray(payload)) return payload;
    for (const key of keys) {
      if (Array.isArray(payload?.[key])) return payload[key];
    }
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const normalizeJobPayload = (payload = {}) => {
    const title = String(payload.title ?? "").trim();
    const description = String(payload.description ?? "").trim();
    const roleType = String(payload.role_type ?? "").trim() || "General Teacher";
    const employmentType = String(payload.employment_type ?? "full-time")
      .trim()
      .toLowerCase();
    const location = String(payload.location ?? "").trim();
    const responsibilities = normalizeResponsibilityList(payload.responsibilities || payload.requirements);
    const teachingLevel = String(payload.teaching_level ?? "").trim() || "SS1 – SS3 (Senior Secondary)";
    const requiredExperience = String(payload.required_experience ?? "").trim() || "5+ years";
    const requiredQualification = String(payload.required_qualification ?? "").trim() || "B.Ed or equivalent";
    const applicationDeadline = String(payload.application_deadline ?? "").trim();
    const isFeatured = Boolean(payload.is_featured);

    return {
      title,
      description,
      role_type: roleType,
      employment_type: ["full-time", "part-time", "contract", "temporary"].includes(
        employmentType,
      )
        ? employmentType
        : "full-time",
      salary_range: String(payload.salary_range ?? "").trim() || "Competitive",
      location,
      responsibilities,
      requirements: responsibilities,
      teaching_level: teachingLevel,
      required_experience: requiredExperience,
      required_qualification: requiredQualification,
      application_deadline: applicationDeadline,
      is_featured: isFeatured,
      status: "open",
    };
  };

  const openJobForm = (fromTab = activeTab) => {
    setPreviousTab(fromTab === "post-job" ? "overview" : fromTab);
    setEditingJobId(null);
    setSelectedJob(null);
    setSelectedApplicant(null);
    setActiveTab("post-job");
  };

  const openEditJobForm = (job) => {
    if (!job) return;
    setPreviousTab("jobs");
    setEditingJobId(job.job_id || job.id);
    setJobForm({
      ...emptyJobForm,
      ...job,
      responsibilities: normalizeResponsibilityList(job.responsibilities || job.requirements),
    });
    setResponsibilityInput("");
    setSelectedJob(null);
    setActiveTab("post-job");
  };

  const openDraftJobForm = (job) => {
    if (!job) return;
    setPreviousTab("jobs");
    setEditingJobId(null);
    setJobForm({
      ...emptyJobForm,
      ...job,
      responsibilities: normalizeResponsibilityList(job.responsibilities || job.requirements),
    });
    setResponsibilityInput("");
    setSelectedJob(null);
    setSelectedApplicant(null);
    setActiveTab("post-job");
  };

  const openJobDetails = (job) => {
    setSelectedJob(job);
    setSelectedApplicant(null);
    setJobDetailView("detail");
    setOpenJobMenuId(null);
  };

  const handleTabChange = (nextTab) => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setActiveTab(nextTab);
    setSelectedJob(null);
    setSelectedApplicant(null);
    setSelectedTeacherProfile(null);
    setOpenJobMenuId(null);
    setExperienceMenuOpen(false);
    setQualificationMenuOpen(false);
  };

  const dismissSnackbar = () => {
    if (!snackbar) return;
    setIsSnackbarClosing(true);
    window.setTimeout(() => {
      setSnackbar(null);
      setIsSnackbarClosing(false);
    }, 260);
  };

  const showSnackbar = (title, message) => {
    setIsSnackbarClosing(false);
    setSnackbar({ title, message });
  };

  const handleSchoolLogoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSchoolLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSchoolProfile = async () => {
    try {
      setSavingSchoolProfile(true);
      setError("");
      await profileService.updateSchool({
        school_name: schoolNameValue.trim(),
        school_type: schoolProfile?.school_type || "private",
        address: addressValue.trim(),
        website: websiteValue.trim(),
        email: emailValue.trim(),
        phone: phoneValue.trim(),
      });

      const response = await profileService.getMe();
      const payload = response?.data?.data ?? response?.data ?? {};
      const profile = payload?.profile || payload?.school_profile || payload?.school || {};
      const account = payload?.user || payload;
      const mergedProfile = { ...account, ...profile };

      setSchoolProfile(mergedProfile);
      setSchoolNameValue(mergedProfile.school_name || schoolNameValue);
      setEmailValue(mergedProfile.email || account.email || emailValue);
      setPhoneValue(mergedProfile.phone || account.phone || phoneValue);
      setWebsiteValue(mergedProfile.website || websiteValue);
      setAddressValue(mergedProfile.address || addressValue);
      setIsSchoolNameEditing(false);
      setIsEmailEditing(false);
      setIsPhoneEditing(false);
      setIsWebsiteEditing(false);
      setIsAddressEditing(false);
      showSnackbar("Profile updated", "Your school information has been saved successfully.");
    } catch (err) {
      const message = apiErrorMessage(err, "Unable to save school information.");
      setError(message);
      showSnackbar("Profile update failed", message);
    } finally {
      setSavingSchoolProfile(false);
    }
  };

  const isNotificationUnread = (notification = {}) => {
    const readValue = notification.is_read ?? notification.read;
    return readValue === false || readValue === "false" || Number(readValue) === 0;
  };

  const markAllNotificationsAsRead = async () => {
    const unreadItems = notificationItems.filter((item) => item.unread && item.key);
    if (!unreadItems.length) return;

    try {
      await Promise.all(
        unreadItems.map((item) => featureService.markNotificationRead(item.key)),
      );
      setNotificationItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to mark notifications as read."));
    }
  };

  const handleNotificationItemClick = async (item) => {
    if (!item) return;

    setSelectedNotification(item);
    setIsNotificationModalOpen(true);

    if (item.applicantName) {
      const matchedApplicant = allApplicants.find(
        (app) =>
          (app.teacher_name || app.teacher_email || "")
            .toLowerCase()
            .includes(item.applicantName.toLowerCase()),
      );

      if (matchedApplicant) {
        setSelectedApplicant(matchedApplicant);
      }
    }

    if (item.unread && item.key) await markSchoolNotificationAsRead(item.key);
  };

  const markSchoolNotificationAsRead = async (notificationId) => {
    if (!notificationId) return;
    setNotificationActionLoading((current) => ({ ...current, [notificationId]: "read" }));
    try {
      await featureService.markNotificationRead(notificationId);
      setNotificationItems((prev) => prev.map((item) => (
        item.key === notificationId ? { ...item, unread: false } : item
      )));
      setSelectedNotification((current) => (
        current?.key === notificationId ? { ...current, unread: false } : current
      ));
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to mark this notification as read."));
    } finally {
      setNotificationActionLoading((current) => {
        const next = { ...current };
        delete next[notificationId];
        return next;
      });
    }
  };

  const deleteSchoolNotification = async (notificationId) => {
    if (!notificationId) return;
    setNotificationActionLoading((current) => ({ ...current, [notificationId]: "delete" }));
    try {
      await featureService.deleteNotification(notificationId);
      setNotificationItems((prev) => prev.filter((item) => item.key !== notificationId));
      setIsNotificationModalOpen(false);
      setSelectedNotification(null);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to delete this notification."));
    } finally {
      setNotificationActionLoading((current) => {
        const next = { ...current };
        delete next[notificationId];
        return next;
      });
    }
  };

  useEffect(() => {
    if (!snackbar) return undefined;
    const timeoutId = window.setTimeout(() => {
      dismissSnackbar();
    }, 4500);
    return () => window.clearTimeout(timeoutId);
  }, [snackbar]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isShortlistModalOpen && !isShortlistSuccessOpen && !isTeacherInviteModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isShortlistModalOpen, isShortlistSuccessOpen, isTeacherInviteModalOpen]);

  const currentUserId = useMemo(
    () => user?.user_id || user?.id || user?.school_id || "",
    [user],
  );

  const schoolDraftStorageKey = `staffroom_school_job_drafts_${currentUserId || "unknown"}`;

  const readSchoolJobDrafts = () => {
    try {
      const storedDrafts = JSON.parse(localStorage.getItem(schoolDraftStorageKey) || "[]");
      return Array.isArray(storedDrafts) ? storedDrafts : [];
    } catch (_err) {
      return [];
    }
  };

  const saveSchoolJobDraft = () => {
    const draftId = editingJobId || `draft-${Date.now()}`;
    const draft = {
      ...jobForm,
      job_id: draftId,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const nextDrafts = [
      ...readSchoolJobDrafts().filter((item) => String(item.job_id || item.id) !== String(draftId)),
      draft,
    ];

    localStorage.setItem(schoolDraftStorageKey, JSON.stringify(nextDrafts));
    setJobs((prev) => [
      draft,
      ...prev.filter((job) => String(job.job_id || job.id) !== String(draftId)),
    ]);
    setJobForm(emptyJobForm);
    setResponsibilityInput("");
    setEditingJobId(null);
    setSelectedJob(null);
    setSelectedApplicant(null);
    setActiveTab(previousTab);
    showSnackbar("Draft saved successfully", "Your job draft has been saved successfully");
  };

  const loadSchoolNotifications = async () => {
    try {
      const response = await featureService.getNotifications();
      const notifList = extractApiList(response, ["notifications"]);

      const iconMap = {
        application_status: FiFileText,
        message: FiMessageSquare,
        job_expiry: FiAlertCircle,
        system: FiCheckCircle,
      };

      const mapped = notifList.map((n) => {
        const isApplication = n.type === "application_status";
        return {
          key: n.notification_id || n.id || `notif-${Date.now()}-${Math.random()}`,
          tab: isApplication ? "applicants" : "notifications",
          type: isNotificationUnread(n) ? "highlight" : "simple",
          accent: isApplication ? "green" : "",
          icon: iconMap[n.type] || FiBell,
          label: (n.type || "notification").toUpperCase().replace(/_/g, " "),
          title: n.title || "Notification",
          unread: isNotificationUnread(n),
          description: n.message || n.description || "",
          time: n.created_at
            ? new Date(n.created_at).toLocaleDateString()
            : "Recently",
        };
      });

      setNotificationItems(mapped);
    } catch (_err) {
      // Notifications are non-critical — silently keep whatever is already loaded
    }
  };

  useEffect(() => {
    if (!isSchool) return undefined;
    const intervalId = window.setInterval(() => {
      loadSchoolNotifications();
    }, 60000);
    return () => window.clearInterval(intervalId);
  }, [isSchool]);

  const loadSchoolJobs = async () => {
    try {
      const response = await jobService.getJobs({});
      const jobList = extractApiList(response, ["jobs"]);
      const savedDrafts = readSchoolJobDrafts();
      const jobsWithDrafts = [...savedDrafts, ...jobList];

      if (isSchool && currentUserId) {
        const ownedJobs = jobsWithDrafts.filter((job) => {
          if (String(job.status || "").toLowerCase() === "draft") return true;
          const candidate =
            job.school_id || job.user_id || job.created_by || "";
          return candidate === currentUserId || candidate === user?.id;
        });

        if (ownedJobs.length) {
          setJobs(ownedJobs);
          return;
        }
      }

      setJobs(jobsWithDrafts);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to load school jobs."));
    }
  };

  const loadSchoolProfileForJobLocation = async () => {
    if (!isSchool) return;

    try {
      const response = await profileService.getMe();
      const payload = response?.data?.data ?? response?.data ?? {};
      const profile = payload?.profile ?? payload?.school_profile ?? payload?.school ?? payload?.data?.profile ?? {};
      const userProfile = payload?.user ?? payload?.data?.user ?? {};
      const mergedProfile = { ...userProfile, ...profile };

      setSchoolProfile(mergedProfile);

      const locationFromProfile = [
        mergedProfile?.city,
        mergedProfile?.state,
        mergedProfile?.country,
      ].filter(Boolean).join(", ") || mergedProfile?.location || "";

      const nextSchoolName = mergedProfile?.school_name || user?.school_name || user?.full_name || "";
      const nextEmail = mergedProfile?.email || user?.email || "";
      const nextPhone = mergedProfile?.phone || user?.phone || "";
      const nextWebsite = mergedProfile?.website || user?.website || "";
      const nextAddress = [
        mergedProfile?.address,
        mergedProfile?.city,
        mergedProfile?.state,
        mergedProfile?.country,
      ].filter(Boolean).join("\n") || mergedProfile?.location || "";

      setSchoolNameValue(nextSchoolName);
      setEmailValue(nextEmail);
      setPhoneValue(nextPhone);
      setWebsiteValue(nextWebsite);
      setAddressValue(nextAddress);
      setSchoolLogoPreview(toAssetUrl(mergedProfile?.logo_url || mergedProfile?.school_logo || mergedProfile?.logo || ""));

      if (locationFromProfile) {
        setJobForm((prev) => ({
          ...prev,
          location: prev.location || locationFromProfile,
        }));
        setSchoolLocationLocked(true);
      }
    } catch (_err) {
      setSchoolProfile({});
      setSchoolLocationLocked(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminService.getTeachers();
      const users = extractApiList(response, ["teachers", "users"]);

      const normalizedUsers = users
        .filter(Boolean)
        .map((entry) => ({
          ...entry,
          role: String(entry?.role || "teacher").toLowerCase(),
          full_name:
            entry?.full_name ||
            entry?.teacher_name ||
            [entry?.first_name, entry?.last_name].filter(Boolean).join(" ") ||
            entry?.name ||
            "Teacher",
          email: entry?.email || entry?.teacher_email || "",
          phone: entry?.phone || entry?.teacher_phone || "",
          subject: entry?.subject || entry?.role_title || entry?.specialization || "General",
          location: entry?.location || entry?.state || entry?.city || "Nigeria",
          experience: entry?.experience || entry?.experience_years || "Not specified",
          availability: entry?.availability || "Available",
        }));

      setAllUsers(normalizedUsers);
    } catch (_err) {
      setAllUsers([]);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        if (isSchool) {
          await Promise.all([
            loadSchoolJobs(),
            loadUsers(),
            loadSchoolNotifications(),
            loadSchoolProfileForJobLocation(),
            loadSavedTeachers(),
          ]);
        } else {
          const [statsRes, verificationsRes] = await Promise.all([
            adminService.getStats(),
            adminService.getVerifications(),
          ]);

          const statsPayload = statsRes?.data?.data ?? statsRes?.data ?? {};
          const verificationPayload =
            verificationsRes?.data?.data?.verifications ??
            verificationsRes?.data?.verifications ??
            [];

          setStats(statsPayload);
          setVerifications(verificationPayload);
        }
      } catch (err) {
        setError(apiErrorMessage(err, "Unable to load dashboard data."));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isSchool, currentUserId]);

  const normalizeInterviewPayload = (payload) => {
    if (!payload) return null;

    const possiblePayloads = Array.isArray(payload)
      ? payload
      : [payload];

    const candidate = possiblePayloads.find((entry) => entry && typeof entry === "object") ?? null;
    if (!candidate) return null;

    const nested =
      candidate.interview ??
      candidate.data?.interview ??
      candidate.data?.details ??
      candidate.data?.result ??
      candidate.result?.interview ??
      candidate.details?.interview ??
      candidate.data ??
      candidate.result ??
      candidate.details ??
      candidate;

    const interviewObject =
      nested && typeof nested === "object" && !Array.isArray(nested)
        ? nested
        : Array.isArray(nested) && nested.length > 0
          ? nested[0]
          : null;

    if (!interviewObject || typeof interviewObject !== "object") return null;

    return {
      ...interviewObject,
      interview_date: interviewObject.interview_date || interviewObject.interviewDate || interviewObject.date || candidate.interview_date || candidate.date || "",
      interview_time: interviewObject.interview_time || interviewObject.interviewTime || interviewObject.time || candidate.interview_time || candidate.time || "",
      venue: interviewObject.venue || interviewObject.location || candidate.venue || candidate.location || "",
      meeting_link: interviewObject.meeting_link || interviewObject.meetingLink || candidate.meeting_link || candidate.meetingLink || "",
      status: interviewObject.status || candidate.status || "",
      updated_at: interviewObject.updated_at || interviewObject.updatedAt || candidate.updated_at || candidate.updatedAt || "",
    };
  };

  const loadApplicantsForJob = async (jobId) => {
    if (!jobId) return;

    try {
      const response = await applicationService.getApplicantsByJob(jobId);
      const list = extractApiList(response, ["applications"]);
      const enrichedList = await Promise.all(list.map(async (app) => {
        const applicationId = app.application_id || app.id;
        if (!applicationId) return app;

        try {
          const interviewResponse = await applicationService.getInterview(applicationId);
          const payload = interviewResponse?.data?.data ?? interviewResponse?.data ?? {};
          return { ...app, interview: normalizeInterviewPayload(payload) };
        } catch {
          return { ...app, interview: null };
        }
      }));
      setApplicantsByJob((prev) => ({ ...prev, [jobId]: enrichedList }));
    } catch (err) {
      setApplicantsByJob((prev) => ({ ...prev, [jobId]: [] }));
    }
  };

  useEffect(() => {
    if (!isSchool || !jobs.length) return;

    jobs.forEach((job) => {
      const jobId = job.job_id || job.id;
      if (jobId) {
        loadApplicantsForJob(jobId);
      }
    });
  }, [isSchool, jobs]);

  const handleCreateJob = async (e) => {
    e.preventDefault();

    const payload = normalizeJobPayload(jobForm);

    if (!payload.title || !payload.description || !payload.location) {
      setError("Please add a title, description, and location before publishing the job.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      let response;
      if (editingJobId) {
        response = await jobService.updateJob(editingJobId, payload);
      } else {
        response = await jobService.createJob(payload);
      }

      const rawResponse = response?.data?.data ?? response?.data ?? {};
      const jobPayload = rawResponse?.job ?? rawResponse ?? payload;

      const savedJob = {
        ...(jobPayload && typeof jobPayload === "object" ? jobPayload : {}),
        ...payload,
        job_id: editingJobId || jobPayload?.job_id || jobPayload?.id || rawResponse?.job_id || rawResponse?.id || `JOB-${Date.now()}`,
        title: jobPayload?.title || payload.title,
        description: jobPayload?.description || payload.description,
        role_type: jobPayload?.role_type || payload.role_type,
        employment_type: jobPayload?.employment_type || payload.employment_type,
        salary_range: jobPayload?.salary_range || payload.salary_range,
        location: jobPayload?.location || payload.location,
        responsibilities: normalizeResponsibilityList(jobPayload?.responsibilities || payload.responsibilities),
        requirements: jobPayload?.requirements || payload.requirements,
        status: jobPayload?.status || "active",
      };

      if (editingJobId) {
        setJobs((prev) => prev.map((job) =>
          (job.job_id || job.id) === editingJobId ? { ...job, ...savedJob } : job
        ));
      } else {
        setJobs((prev) => [savedJob, ...prev.filter((job) => (job.job_id || job.id) !== savedJob.job_id)]);
      }

      setJobForm(emptyJobForm);
      setEditingJobId(null);
      setSelectedJob(null);
      setSelectedApplicant(null);
      setActiveTab(previousTab);
      showSnackbar(
        editingJobId ? "Job updated successfully" : "Vacancy published successfully",
        editingJobId ? "Your job posting has been updated" : "New job has been published successfully",
      );
    } catch (err) {
      setError(apiErrorMessage(err, editingJobId ? "Unable to update this job." : "Unable to create this job."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!jobId) return;

    try {
      setError("");
      await jobService.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => (job.job_id || job.id) !== jobId));
      setApplicantsByJob((prev) => {
        const next = { ...prev };
        delete next[jobId];
        return next;
      });
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to delete this job."));
    } finally {
      setOpenJobMenuId(null);
    }
  };

  const handleShortlistApplicant = (applicant) => {
    if (!applicant) return;

    setSelectedApplicant(applicant);
    setShortlistForm((prev) => ({
      ...prev,
      recipientName: applicant.teacher_name || applicant.full_name || applicant.name || "Applicant",
      recipientPhone: applicant.teacher_phone || applicant.phone || applicant.profile?.phone || "",
    }));
    setIsShortlistModalOpen(true);
    setOpenApplicantMenuId(null);
  };

  const handleConfirmShortlist = async () => {
    const applicationId = selectedApplicant?.application_id || selectedApplicant?.id;
    const jobId = selectedApplicant?.jobId || selectedApplicant?.job_id || selectedJob?.job_id || selectedJob?.id;
    const interviewType = String(shortlistForm.interviewType || "").toLowerCase().includes("physical")
      ? "physical"
      : "virtual";

    if (!applicationId) {
      setShortlistError("This applicant is missing an application ID.");
      return;
    }
    if (!shortlistForm.interviewType || !shortlistForm.interviewDate || !shortlistForm.interviewTime) {
      setShortlistError("Please provide the interview type, date, and time.");
      return;
    }
    if (interviewType === "physical" && !shortlistForm.interviewVenue.trim()) {
      setShortlistError("Please provide the interview venue.");
      return;
    }
    if (interviewType === "virtual" && !shortlistForm.interviewLink.trim()) {
      setShortlistError("Please provide the meeting link.");
      return;
    }

    try {
      setShortlistSubmitting(true);
      setShortlistError("");
      const payload = {
        interview_type: interviewType,
        interview_date: shortlistForm.interviewDate,
        interview_time: shortlistForm.interviewTime,
        ...(interviewType === "physical"
          ? { venue: shortlistForm.interviewVenue.trim() }
          : { meeting_link: shortlistForm.interviewLink.trim() }),
        instructions: shortlistForm.additionalInstructions?.trim() || "",
        candidate_message: shortlistForm.candidateMessage?.trim() || "",
        template_name: shortlistForm.responseTemplate || "",
      };

      await applicationService.scheduleInterview(applicationId, payload);
      if (jobId) await loadApplicantsForJob(jobId);
      setIsShortlistModalOpen(false);
      setIsShortlistSuccessOpen(true);
      showSnackbar("Interview scheduled", "The candidate has been shortlisted and notified.");
    } catch (err) {
      setShortlistError(apiErrorMessage(err, "Unable to shortlist this candidate."));
    } finally {
      setShortlistSubmitting(false);
    }
  };

  const handleRejectApplicant = async () => {
    const activeTarget = rejectTarget || (selectedApplicant ? {
      jobId: selectedApplicant.jobId || selectedApplicant.job_id || selectedJob?.job_id || selectedJob?.id,
      applicantId: selectedApplicant.application_id || selectedApplicant.id,
    } : null);

    if (!activeTarget?.jobId || !activeTarget?.applicantId) return;

    const trimmedMessage = rejectMessage.trim();
    if (!trimmedMessage) {
      setRejectError("Please provide a rejection reason before continuing.");
      return;
    }

    try {
      setRejectSubmitting(true);
      setRejectError("");

      await applicationService.updateApplicationStatus(activeTarget.applicantId, {
        status: "rejected",
        message: trimmedMessage,
        rejection_message: trimmedMessage,
      });

      setApplicantsByJob((prev) => ({
        ...prev,
        [activeTarget.jobId]: (prev[activeTarget.jobId] || []).map((app) => {
          const currentId = app.application_id || app.id;
          return currentId === activeTarget.applicantId ? { ...app, status: "rejected" } : app;
        }),
      }));

      if (selectedApplicant && (selectedApplicant.application_id || selectedApplicant.id) === activeTarget.applicantId) {
        setSelectedApplicant((current) => (current ? { ...current, status: "rejected" } : current));
      }

      setIsRejectModalOpen(false);
      setRejectTarget(null);
      setRejectMessage("");
      showSnackbar("Application rejected", "The candidate has been notified with the rejection reason.");
    } catch (err) {
      setRejectError(apiErrorMessage(err, "Unable to reject this applicant."));
    } finally {
      setRejectSubmitting(false);
    }
  };

  const openRejectApplicantModal = (jobId, applicantId) => {
    if (!jobId || !applicantId) return;

    setRejectTarget({ jobId, applicantId });
    setRejectMessage("");
    setRejectError("");
    setIsRejectModalOpen(true);
    setOpenApplicantMenuId(null);
  };

  const handleCloseJob = async (jobId) => {
    if (!jobId) return;

    try {
      setError("");
      setJobs((prev) =>
        prev.map((job) =>
          (job.job_id || job.id) === jobId ? { ...job, status: "closed" } : job,
        ),
      );
      setOpenJobMenuId(null);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to close this job."));
    }
  };

  const handleStatusChange = async (jobId, applicationId, nextStatus) => {
    if (!jobId || !applicationId || !nextStatus) return;

    try {
      setStatusUpdating((prev) => ({ ...prev, [applicationId]: true }));
      setError("");
      await applicationService.updateApplicationStatus(applicationId, {
        status: nextStatus,
      });

      setApplicantsByJob((prev) => ({
        ...prev,
        [jobId]: (prev[jobId] || []).map((app) => {
          const currentId = app.application_id || app.id;
          return currentId === applicationId
            ? { ...app, status: nextStatus }
            : app;
        }),
      }));
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to update application status."));
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const adminLabel =
    user?.role === "school" ? "School Dashboard" : "Admin Dashboard";

  const schoolProfileLogoPath =
    schoolProfile?.logo_url ||
    schoolProfile?.school_logo ||
    schoolProfile?.logo ||
    user?.logo_url ||
    user?.school_logo ||
    user?.profile_image ||
    user?.avatar_url ||
    user?.profile_picture ||
    "";
  const schoolProfileLogo = schoolProfileLogoPath
    ? /^https?:\/\//i.test(schoolProfileLogoPath)
      ? schoolProfileLogoPath
      : `${API_ORIGIN}/${String(schoolProfileLogoPath).replace(/^\/+/, "")}`
    : "";

  const schoolProfileCompletion = useMemo(() => {
    const completionFields = [
      schoolNameValue || schoolProfile?.school_name || user?.school_name || user?.full_name,
      emailValue || schoolProfile?.email || user?.email,
      phoneValue || schoolProfile?.phone || user?.phone,
      websiteValue || schoolProfile?.website || user?.website,
      addressValue || schoolProfile?.address || schoolProfile?.location,
      schoolProfileLogo || schoolProfile?.logo_url || schoolProfile?.school_logo || schoolProfile?.logo,
    ];

    const completedCount = completionFields.filter((value) => {
      if (typeof value === "string") return value.trim().length > 0;
      return Boolean(value);
    }).length;

    return Math.min(100, Math.max(0, Math.round((completedCount / completionFields.length) * 100)));
  }, [addressValue, emailValue, phoneValue, schoolNameValue, schoolProfile, schoolProfileLogo, user, websiteValue]);

  const schoolDisplayName =
    schoolProfile?.school_name ||
    user?.school_name ||
    user?.full_name ||
    "School";
  const schoolInitials = (schoolDisplayName || "S")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "S";

  const currentHour = new Date().getHours();
  const schoolGreeting =
    currentHour >= 5 && currentHour < 12
      ? "Good morning"
      : currentHour >= 12 && currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  const navItems = isSchool
    ? [
        ["overview", "Dashboard", FiGrid],
        ["jobs", "Jobs", FiBriefcase],
        ["applicants", "Applicants", FiUsers],
        ["notifications", "Notifications", FiBell],
        ["settings", "Settings", FiSettings],
      ]
    : [
        ["overview", "Dashboard", FiGrid],
        ["verifications", "Verifications", FiCheckCircle],
        ["notifications", "Notifications", FiBell],
        ["settings", "Settings", FiSettings],
      ];

  const allApplicants = Object.entries(applicantsByJob).flatMap(
    ([jobId, applicants]) => applicants.map((app) => ({ ...app, jobId })),
  );
  const getInterviewStart = (interview = {}) => {
    const date = interview.interview_date || interview.interviewDate || interview.date;
    const time = interview.interview_time || interview.interviewTime || interview.time;
    if (!date) return null;

    const safeTime = time ? String(time).trim() : "00:00:00";
    const start = new Date(`${date}T${safeTime}`);
    return Number.isNaN(start.getTime()) ? null : start;
  };
  const getUpdatedTimestamp = (app = {}) => {
    const rawValue =
      app.updated_at ||
      app.updatedAt ||
      app.updated_date ||
      app.updatedDate ||
      app.interview?.updated_at ||
      app.interview?.updatedAt ||
      app.interview?.updated_date ||
      app.interview?.updatedDate ||
      app.last_updated ||
      app.lastUpdated ||
      app.application_updated_at ||
      app.applicationUpdatedAt;

    if (!rawValue) return null;
    const parsed = new Date(rawValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const getApplicantDisplayStatus = (app = {}) => {
    const rawStatus = String(app.status || "").toLowerCase();
    if (rawStatus === "interviewing") return "shortlisted";
    if (!app.interview || (rawStatus !== "shortlisted" && rawStatus !== "interviewing")) {
      return rawStatus || "pending";
    }

    return "shortlisted";
  };
  const shortlistedCandidates = allApplicants.filter((app) => {
    const status = String(app.status || app.interview?.status || "").toLowerCase();
    return status === "shortlisted" || status === "interviewing";
  });
  const upcomingInterviews = allApplicants
    .map((app) => {
      const interview = normalizeInterviewPayload(app.interview || app) || null;
      return { ...app, interview };
    })
    .filter((app) => {
      const status = String(app.status || app.interview?.status || "").toLowerCase();
      const interview = app.interview || null;
      if (!interview || (status !== "shortlisted" && status !== "interviewing")) {
        return false;
      }

      const interviewStart = getInterviewStart(interview);
      return interviewStart && interviewStart.getTime() >= Date.now();
    })
    .sort((a, b) => {
      const aDate = getInterviewStart(a.interview || {})?.getTime?.() ?? 0;
      const bDate = getInterviewStart(b.interview || {})?.getTime?.() ?? 0;
      return bDate - aDate;
    })
    .slice(0, 3);
  const scheduledInterviews = upcomingInterviews;

  const openShortlistedApplicants = () => {
    const shortlistedJobId = shortlistedCandidates[0]?.jobId;
    const job = jobs.find((item) => String(item.job_id || item.id) === String(shortlistedJobId)) || jobs[0];
    if (!job) {
      handleTabChange("applicants");
      return;
    }

    setSelectedApplicant(null);
    setSelectedJob(job);
    setJobDetailView("applicants");
    setApplicantFilter("Shortlisted");
    setApplicantPage(1);
    setActiveTab("jobs");
    loadApplicantsForJob(job.job_id || job.id);
  };

  const renderSchoolOverview = () => {
    const totalApplicants = Number(
      stats.total_applications ?? allApplicants.length ?? 0,
    );
    const activeJobs = Number(stats.active_jobs ?? jobs.length ?? 0);
    const shortlistedApplicants = shortlistedCandidates.length;

    return (
      <div className="school-overview">
        <section className="school-overview-hero">
          <div className="school-welcome-panel">
            <h2>
              {schoolGreeting}, {user?.full_name || "School"}
            </h2>
            <p>
              Manage your school's hiring and find the right teachers for your
              team.
              <br />
              Review recent applications and schedule upcoming interviews.
            </p>
            <div className="school-overview-actions">
              <button type="button" onClick={() => openJobForm("overview")}>
                <FiPlus size={14} /> Post a Job
              </button>
              <button type="button" onClick={() => handleTabChange("applicants")}>
                View Applicants
              </button>
            </div>
          </div>

          <div className="school-profile-card">
            <div className="school-profile-heading">
              <span className="school-profile-icon">
                <FiCheckCircle size={14} />
              </span>
              <div>
                <strong>School Profile</strong>
                <span>Attract top educators</span>
              </div>
            </div>
            <div className="school-profile-progress-label">
              <span>Completeness</span>
              <strong>{schoolProfileCompletion}%</strong>
            </div>
            <div className="school-profile-progress">
              <span style={{ width: `${schoolProfileCompletion}%` }} />
            </div>
            <p>
              <FiInfo size={11} /> {schoolProfileCompletion >= 100 ? "Your school profile is complete." : "Add a cover photo to reach 100%"}
            </p>
          </div>
        </section>

        <section
          className="school-stat-grid"
          aria-label="School recruitment statistics"
        >
          {[
            ["Active Jobs", activeJobs, FiBriefcase],
            ["Total Applicants", totalApplicants, FiUsers],
            ["Shortlisted", shortlistedApplicants, FiCheckCircle],
            ["Upcoming Interviews", scheduledInterviews.length, FiCalendar],
          ].map(([label, value, Icon]) => (
            <div key={label} className="school-stat-card">
              <span>{label}</span>
              {React.createElement(Icon, { size: 17 })}
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <section className="school-overview-section school-applicants-section">
          <div className="school-section-heading">
            <h3>Recent Applicants</h3>
          </div>
          <div className="school-applicant-table">
            <div className="school-table-row school-table-head">
              <span>Applicant Name</span>
              <span>Job Info</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {(allApplicants.length
              ? allApplicants.slice(0, 3)
              : []
            ).map((app, index) => {
              const status = getApplicantDisplayStatus(app) || "pending";
              const statusLabel = status === "pending"
                ? "Submitted"
                : status.charAt(0).toUpperCase() + status.slice(1);
              return (
                <div
                  className="school-table-row"
                  key={app.application_id || app.id || index}
                >
                  <span className="school-applicant-name">
                    <i>
                      {String(
                        app.teacher_name || app.teacher_email || "Applicant",
                      )
                        .slice(0, 2)
                        .toUpperCase()}
                    </i>
                    {app.teacher_name || app.teacher_email || "Applicant"}
                  </span>
                  <span>
                    {jobs.find((job) => (job.job_id || job.id) === app.jobId)
                      ?.title || "Teaching opportunity"}
                  </span>
                  <span>
                    <b
                      className={`school-status school-status-${String(status).toLowerCase()}`}
                    >
                      {statusLabel}
                    </b>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const job = jobs.find((item) => String(item.job_id || item.id) === String(app.jobId));
                      if (!job) return;
                      setSelectedJob(job);
                      setSelectedApplicant(app);
                      setApplicantFilter("All");
                      setApplicantPage(1);
                      setJobDetailView("applicants");
                      setActiveTab("jobs");
                      loadApplicantsForJob(app.jobId);
                    }}
                    className="school-review-button"
                  >
                    Review
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="school-overview-section school-postings-section">
          <div className="school-section-heading">
            <h3>Active Postings</h3>
            <button type="button" onClick={() => handleTabChange("jobs")}>
              View All <span>→</span>
            </button>
          </div>
          <div className="school-posting-grid">
            {(jobs.length
              ? jobs.slice(0, 2)
              : [
                  {
                    job_id: "empty",
                    title: "No active postings",
                    location: "Create your first job",
                  },
                ]
            ).map((job) => {
              const jobId = job.job_id || job.id;
              return (
                <div className="school-posting-card" key={jobId}>
                  <div>
                    <strong>{job.title || "Teaching role"}</strong>
                    <span>
                      {job.employment_type || "Full-time"} ·{" "}
                      {job.location || "Location pending"}
                    </span>
                  </div>
                  <FiBriefcase className="school-posting-icon" size={16} />
                  <div className="school-posting-footer">
                    <span>
                      <FiUsers size={13} />{" "}
                      {(applicantsByJob[jobId] || []).length} Applicants
                    </span>
                    <small>Posted recently</small>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="school-overview-section school-interviews-section">
          <div className="school-section-heading">
            <h3>Upcoming Interviews</h3>
            <FiCalendar size={15} />
          </div>
          {scheduledInterviews.length > 0 ? scheduledInterviews.map((app, index) => {
            const job = jobs.find((item) => String(item.job_id || item.id) === String(app.jobId));
            const interview = app.interview || {};
            const interviewDate = interview.interview_date || interview.date || "Date not provided";
            const interviewTime = interview.interview_time || interview.time || "Time not provided";
            const interviewLocation = interview.venue || interview.meeting_link || interview.location || "Interview location not provided";
            const interviewWhen = [interviewDate, interviewTime].filter(Boolean).join(" ");

            return (
              <div className="school-interview-row" key={app.application_id || app.id || index}>
                <div className="school-interview-main">
                  <span className="school-interview-icon"><FiCalendar size={15} /></span>
                  <div className="school-interview-copy">
                    <strong>{app.teacher_name || app.teacher_email || "Applicant"}</strong>
                    <small>{job?.title || "Teaching opportunity"}</small>
                    <small>{interviewLocation}</small>
                  </div>
                </div>
                <span className="school-interview-time">{interviewWhen || "Schedule pending"}</span>
              </div>
            );
          }) : (
            <div className="school-empty-interviews">
              <span><FiCalendar size={15} /></span>
              <div>
                <strong>No shortlisted interviews scheduled</strong>
                <small>Upcoming interview slots for shortlisted candidates will appear here.</small>
              </div>
            </div>
          )}
          <button type="button" className="school-schedule-button" onClick={openShortlistedApplicants}>
            View Shortlisted Candidates
          </button>
        </section>

      </div>
    );
  };

  const renderDesktopNotifications = () => {
    const unreadCount = notificationItems.filter((item) => item.unread).length;

    return (
      <div className="school-desktop-notifications">
        <div className="school-notifications-heading">
          <div>
            <h2>Notifications</h2>
            <p>
              <strong>{unreadCount} UNREAD</strong>
              <span>You have new updates.</span>
            </p>
          </div>
          <button type="button" onClick={markAllNotificationsAsRead}>
            <FiCheckCircle size={14} /> Mark all as read
          </button>
        </div>
        <div className="school-notifications-panel">
          <h3>Today</h3>
          {notificationItems.slice(0, Math.min(3, visibleSchoolNotificationCount)).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                className={`school-notification-${item.type} ${
                  item.accent ? `school-notification-${item.type}--${item.accent}` : ""
                } ${item.unread ? "is-unread" : ""}`}
                onClick={() => handleNotificationItemClick(item)}
              >
                <span className="school-notification-icon">
                  <Icon size={17} />
                </span>
                <div>
                  <b>{item.label}</b>
                  <strong>{item.title}</strong>
                  {item.description && <p>{item.description}</p>}
                </div>
                <time>{item.time}</time>
              </button>
            );
          })}
          <h3>Yesterday</h3>
          {notificationItems.slice(3, Math.min(5, visibleSchoolNotificationCount)).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                className={`school-notification-${item.type} ${item.unread ? "is-unread" : ""}`}
                onClick={() => handleNotificationItemClick(item)}
              >
                <span className="school-notification-icon">
                  <Icon size={17} />
                </span>
                <div>
                  <b>{item.label}</b>
                  <strong>{item.title}</strong>
                  {item.description && <p>{item.description}</p>}
                </div>
                <time>{item.time}</time>
              </button>
            );
          })}
          <h3>Earlier</h3>
          {notificationItems.slice(5, visibleSchoolNotificationCount).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                className={`school-notification-simple ${item.unread ? "is-unread" : ""}`}
                onClick={() => handleNotificationItemClick(item)}
              >
                <span className="school-notification-icon">
                  <Icon size={17} />
                </span>
                <div>
                  <b>{item.label}</b>
                  <strong>{item.title}</strong>
                  {item.description && <p>{item.description}</p>}
                </div>
                <time>{item.time}</time>
              </button>
            );
          })}
          {notificationItems.length > visibleSchoolNotificationCount && (
            <button type="button" className="school-load-more" onClick={() => setVisibleSchoolNotificationCount((count) => count + 10)}>
              Load More <FiChevronDown size={13} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const addResponsibility = () => {
    const responsibility = responsibilityInput.trim();
    if (!responsibility) return;

    setJobForm((current) => ({
      ...current,
      responsibilities: [...normalizeResponsibilityList(current.responsibilities), responsibility],
    }));
    setResponsibilityInput("");
  };

  const removeResponsibility = (indexToRemove) => {
    setJobForm((current) => ({
      ...current,
      responsibilities: normalizeResponsibilityList(current.responsibilities).filter((_, index) => index !== indexToRemove),
    }));
  };

  const renderJobForm = () => (
    <div className="school-job-form-page">
      <div className="school-job-form-breadcrumb">
        Jobs <span>›</span> {editingJobId ? "Edit Job" : "Post New Job"}
      </div>
      <h2 className="school-job-form-title">{editingJobId ? "Edit Job Posting" : "Post a New Teaching Opportunity"}</h2>
      <p className="school-job-form-subtitle">
        {editingJobId ? "Update the details of your job listing below." : "Reach thousands of qualified educators across the country."}
      </p>

      <form onSubmit={handleCreateJob} className="school-job-form">
        <section className="school-job-form-card school-job-basic-fields">
          <label>
            Job Title
            <input
              placeholder="e.g. Senior Mathematics Teacher"
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              required
            />
          </label>

          <label>
            Subject / Role Type
            <input
              placeholder="e.g. Mathematics Teacher"
              value={jobForm.role_type}
              onChange={(e) => setJobForm({ ...jobForm, role_type: e.target.value })}
            />
          </label>

          <label>
            Teaching Level
            <select
              value={jobForm.teaching_level}
              onChange={(e) => setJobForm({ ...jobForm, teaching_level: e.target.value })}
            >
              <option>Pre KG</option>
              <option>KG</option>
              <option>SS1 – SS3 (Senior Secondary)</option>
              <option>JSS1 – JSS3 (Junior Secondary)</option>
              <option>Primary School</option>
              <option>Early Years</option>
              <option>College / Tertiary</option>
            </select>
          </label>

          <fieldset>
            <legend>Employment Type</legend>
            <div className="school-employment-options">
              {[
                ["full-time", "Full-time"],
                ["part-time", "Part-time"],
                ["contract", "Contract"],
                ["temporary", "Temporary"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={jobForm.employment_type === value ? "is-selected" : ""}
                  onClick={() => setJobForm({ ...jobForm, employment_type: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label>
            Salary Range (Monthly)
            <input
              placeholder="₦ 350,000 – 500,000"
              value={jobForm.salary_range}
              onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
            />
          </label>

          <label>
            School Location
            <div className="school-input-with-icon">
              <FiMapPin size={16} />
              <input
                placeholder="Lekki, Lagos State"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                readOnly={schoolLocationLocked}
                disabled={schoolLocationLocked}
                required
              />
            </div>
          </label>
        </section>

        <section className="school-job-form-card school-job-description-card">
          <label>
            Job Description
            <textarea
              placeholder="Describe the role, what the school is looking for, and the teaching environment..."
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              required
            />
          </label>

          <label>
            Key Responsibilities
            <div className="school-responsibility-input-row">
              <input
                placeholder="e.g. Prepare lesson plans"
                value={responsibilityInput}
                onChange={(e) => setResponsibilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addResponsibility();
                  }
                }}
              />
              <button type="button" onClick={addResponsibility}><FiPlus size={14} /> Add</button>
            </div>
            {normalizeResponsibilityList(jobForm.responsibilities).length > 0 && (
              <ul className="school-responsibility-list">
                {normalizeResponsibilityList(jobForm.responsibilities).map((responsibility, index) => (
                  <li key={`${responsibility}-${index}`}>
                    <span>{responsibility}</span>
                    <button type="button" onClick={() => removeResponsibility(index)} aria-label={`Remove ${responsibility}`}><FiX size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
          </label>
        </section>

        <section className="school-job-form-card school-job-extra-fields">
          <label>
            Required Experience
            <select
              value={jobForm.required_experience}
              onChange={(e) => setJobForm({ ...jobForm, required_experience: e.target.value })}
            >
              <option value="1+ years">1+ years</option>
              <option value="2+ years">2+ years</option>
              <option value="3+ years">3+ years</option>
              <option value="5+ years">5+ years</option>
              <option value="8+ years">8+ years</option>
            </select>
          </label>

          <label>
            Required Qualification
            <input
              placeholder="e.g. B.Ed, TRCN Certification"
              value={jobForm.required_qualification}
              onChange={(e) => setJobForm({ ...jobForm, required_qualification: e.target.value })}
            />
          </label>

          <label>
            Application Deadline
            <div className="school-input-with-icon">
              <FiCalendar size={16} />
              <input
                type="date"
                value={jobForm.application_deadline}
                onChange={(e) => setJobForm({ ...jobForm, application_deadline: e.target.value })}
              />
            </div>
          </label>

          <label className="school-feature-option">
            <input
              type="checkbox"
              checked={jobForm.is_featured}
              onChange={(e) => setJobForm({ ...jobForm, is_featured: e.target.checked })}
            />
            Feature this job (pinned at top)
          </label>
        </section>

        <div className="school-job-form-actions">
          <button
            type="button"
            onClick={saveSchoolJobDraft}
          >
            Save Draft
          </button>
          <button type="submit" disabled={submitting}>
            {submitting
              ? (editingJobId ? "Updating..." : "Publishing...")
              : (editingJobId ? "Update Job" : "Publish Job")}
          </button>
        </div>
      </form>
    </div>
  );

  const renderJobDetailPage = (job) => {
    const description = String(job.description || "").trim();
    const requirements = normalizeResponsibilityList(job.responsibilities || job.requirements);
    const toDetailList = (value) => (Array.isArray(value) ? value : String(value || "").split(/\n|\r|;|•/))
      .map((item) => String(item).replace(/^-\s*/, "").trim())
      .filter(Boolean);
    const qualificationList = toDetailList(job.qualifications || job.qualification);
    const benefitList = toDetailList(job.benefits || job.perks);
    const jobId = job.job_id || job.id;
    const status = String(job.status || "active").toLowerCase();
    const postedAt = job.created_at || job.posted_at || job.published_at || "";
    const timeline = [
      ["Posted on", postedAt],
      ["Application deadline", job.application_deadline],
      ["Expected start", job.expected_start_date || job.start_date],
    ].filter(([, date]) => date && !Number.isNaN(new Date(date).getTime()));
    const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

    return (
      <div className="school-job-detail-page">
        <div className="school-job-detail-back"><button type="button" onClick={() => setSelectedJob(null)}>Jobs</button><span>›</span><strong>{job.title || "Job position"}</strong></div>
        <section className="school-job-detail-hero">
          <div className="school-job-detail-hero-main">
            <div className="school-job-detail-meta-row">
              {job.role_type && <span className="school-job-detail-meta-item"><FiBook size={13} />{job.role_type}</span>}
              {job.employment_type && <span className="school-job-detail-meta-item"><FiClock size={13} />{job.employment_type}</span>}
              {job.location && <span className="school-job-detail-meta-item"><FiMapPin size={13} />{job.location}</span>}
              {job.salary_range && <span className="school-job-detail-meta-item"><FiDollarSign size={13} />{job.salary_range}</span>}
              <span className={`school-job-detail-status school-job-detail-status--${status.replace(/\s+/g, "-")}`}>{status === "open" ? "Active" : status}</span>
            </div>
            <h2>{job.title || "Job position"}</h2>
            <div className="school-job-detail-actions">
              <button type="button" className="school-job-detail-primary" onClick={() => { setJobDetailView("applicants"); setApplicantFilter("All"); setApplicantPage(1); loadApplicantsForJob(jobId); }}><FiUsers size={15} /> View Applicants</button>
              <button type="button" className="school-job-detail-secondary" onClick={() => openEditJobForm(job)}>Edit Job</button>
              {status !== "closed" && <button type="button" className="school-job-detail-close" onClick={() => handleCloseJob(jobId)}>Close Job</button>}
            </div>
          </div>
          {timeline.length > 0 && <aside className="school-job-timeline"><h3>Job Timeline</h3>{timeline.map(([label, date], index) => <div key={label} className="school-job-timeline-item"><span className={index === 0 ? "is-current" : ""} /><div><small>{label}</small><strong>{formatDate(date)}</strong></div></div>)}</aside>}
        </section>
        <section className="school-job-detail-body">
          {description && <div className="school-job-detail-section"><h3>About the Role</h3><p>{description}</p></div>}
          {requirements.length > 0 && <div className="school-job-detail-section"><h3>Responsibilities</h3><ul className="school-job-detail-check-list">{requirements.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          {(job.required_experience || job.required_qualification) && <div className="school-job-detail-section"><h3>Requirements</h3><ul className="school-job-detail-bullets">{job.required_experience && <li>{job.required_experience} of teaching experience</li>}{job.required_qualification && <li>{job.required_qualification}</li>}</ul></div>}
          {qualificationList.length > 0 && <div className="school-job-detail-section"><h3>Qualifications</h3><ul className="school-job-detail-bullets">{qualificationList.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          {benefitList.length > 0 && <div className="school-job-detail-section"><h3>Benefits</h3><ul className="school-job-detail-bullets">{benefitList.map((item) => <li key={item}>{item}</li>)}</ul></div>}
        </section>
      </div>
    );
  };

  const renderJobs = () => (
    <div className="school-jobs-page">
      <div className="school-jobs-heading">
        <h2>Jobs</h2>
      </div>
      <div className="school-jobs-toolbar">
        <div className="school-job-filters">
          {[
            "All Jobs",
            "Active",
            "Draft",
            "Closed",
            "Filled",
            "Pending",
            "Rejected",
          ].map((filter) => (
            <button
              type="button"
              key={filter}
              className={jobFilter === filter ? "is-active" : ""}
              onClick={() => setJobFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="school-jobs-toolbar-right">
          <span>{jobs.length} Jobs</span>
          <button type="button">
            <FiSettings size={14} /> Advanced Filters
          </button>
        </div>
      </div>
      <div className="school-job-list-panel">
        {jobs.length === 0 ? (
          <p className="school-jobs-empty">No jobs published yet.</p>
        ) : (
          jobs
            .filter((job) => {
              if (jobFilter === "All Jobs") return true;
              const jobStatus = String(job.status || "active").trim().toLowerCase();
              if (jobFilter === "Active") return jobStatus === "active" || jobStatus === "open" || jobStatus === "published";
              return jobStatus === jobFilter.toLowerCase();
            })
            .slice(0, visibleSchoolJobCount)
            .map((job) => {
              const jobId = job.job_id || job.id;
              const rawStatus = String(job.status || "active").trim().toLowerCase();
              const status = rawStatus === "open" || rawStatus === "published" ? "active" : rawStatus;
              const statusKey = status.replace(/\s+/g, "-");
              const statusLabel =
                status === "active"
                  ? "Active"
                  : status === "under review"
                    ? "Under Review"
                    : status.charAt(0).toUpperCase() + status.slice(1);
              const applicantCount = (applicantsByJob[jobId] || []).length;
              const postedAt = job.created_at || job.posted_at || job.published_at || "";
              const postedDate = postedAt ? new Date(postedAt) : null;
              const postedLabel = postedDate && !Number.isNaN(postedDate.getTime())
                ? `Posted ${postedDate.toLocaleDateString()}`
                : "Posting date unavailable";
              return (
                <article
                  className="school-job-row"
                  key={jobId}
                  role="button"
                  tabIndex={0}
                  onClick={() => openJobDetails(job)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openJobDetails(job);
                    }
                  }}
                >
                  <div
                    className={`school-job-row-icon school-job-row-icon--${status}`}
                  >
                    <FiBriefcase size={22} />
                  </div>
                  <div className="school-job-row-main">
                    <div className="school-job-row-title">
                      <button
                        type="button"
                        className="school-job-row-title-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openJobDetails(job);
                        }}
                      >
                        {job.title || "Teaching role"}
                      </button>
                      <b
                        className={`school-job-row-status school-job-row-status--${statusKey}`}
                      >
                        {statusLabel}
                      </b>
                    </div>
                    <div className="school-job-row-meta">
                      <span>
                        <FiMapPin size={14} />
                        {job.location || "Location pending"}
                      </span>
                      <span>
                        <FiClock size={14} />
                        {job.employment_type || "Full-time"}
                      </span>
                      <span className="school-job-applicants">
                        <FiUsers size={14} />
                        {applicantCount} Applicants
                      </span>
                      <span>
                        <FiCalendar size={14} />
                        {postedLabel}
                      </span>
                    </div>
                  </div>
                  <div className="school-job-row-actions">
                    {status === "draft" && (
                      <>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDraftJobForm(job);
                          }}
                          className="school-job-continue"
                        >
                          Continue
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(jobId)}
                          className="school-job-discard"
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(jobId)}
                          className="school-job-delete-square"
                          aria-label="Delete draft job"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </>
                    )}
                    {status === "filled" && (
                      <>
                        <button type="button" className="school-job-archive">
                          <FiArchive size={15} /> Archives
                        </button>
                        <div className="school-job-more-wrap">
                          <button
                            type="button"
                            className="school-job-more"
                            aria-label="More job actions"
                            aria-expanded={openJobMenuId === jobId}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenJobMenuId(openJobMenuId === jobId ? null : jobId)
                            }}
                          >
                            <FiMoreVertical size={18} />
                          </button>
                          {openJobMenuId === jobId && (
                            <div className="school-job-menu">
                              <button
                                type="button"
                                onClick={() => handleCloseJob(jobId)}
                              >
                                <span className="school-job-menu-icon"><FiX size={18} /></span>
                                <span>Close Application</span>
                              </button>
                              <button
                                type="button"
                                className="school-job-menu-delete"
                                onClick={() => handleDeleteJob(jobId)}
                              >
                                <span className="school-job-menu-icon"><FiTrash2 size={18} /></span>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {status === "active" && (
                      <>
                        <button
                          type="button"
                          className="school-job-view-applicants"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedJob(job);
                            setJobDetailView("applicants");
                            setSelectedApplicant(null);
                            setApplicantFilter("All");
                            setApplicantPage(1);
                            loadApplicantsForJob(jobId);
                          }}
                        >
                          View applicants
                        </button>
                        <div className="school-job-more-wrap">
                          <button
                            type="button"
                            className="school-job-more"
                            aria-label="More job actions"
                            aria-expanded={openJobMenuId === jobId}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenJobMenuId(openJobMenuId === jobId ? null : jobId)
                            }}
                          >
                            <FiMoreVertical size={18} />
                          </button>
                          {openJobMenuId === jobId && (
                            <div className="school-job-menu">
                              <button
                                type="button"
                                onClick={() => handleCloseJob(jobId)}
                              >
                                <span className="school-job-menu-icon"><FiX size={18} /></span>
                                <span>Close Application</span>
                              </button>
                              <button
                                type="button"
                                className="school-job-menu-delete"
                                onClick={() => handleDeleteJob(jobId)}
                              >
                                <span className="school-job-menu-icon"><FiTrash2 size={18} /></span>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {(status === "pending" || status === "under review" || status === "rejected" || status === "closed") && (
                      <>
                        <button type="button" className="school-job-view" onClick={(event) => { event.stopPropagation(); openJobDetails(job); }}>View</button>
                        <div className="school-job-more-wrap">
                          <button type="button" className="school-job-more" aria-label="More job actions" onClick={(event) => { event.stopPropagation(); setOpenJobMenuId(openJobMenuId === jobId ? null : jobId); }}><FiMoreVertical size={18} /></button>
                          {openJobMenuId === jobId && (
                            <div className="school-job-menu">
                              {status !== "closed" && <button type="button" onClick={() => handleCloseJob(jobId)}><span className="school-job-menu-icon"><FiX size={18} /></span><span>Close Application</span></button>}
                              <button type="button" className="school-job-menu-delete" onClick={() => handleDeleteJob(jobId)}><span className="school-job-menu-icon"><FiTrash2 size={18} /></span><span>Delete</span></button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </article>
              );
            })
        )}
        {jobs.filter((job) => {
          if (jobFilter === "All Jobs") return true;
          const jobStatus = String(job.status || "active").trim().toLowerCase();
          if (jobFilter === "Active") return jobStatus === "active" || jobStatus === "open" || jobStatus === "published";
          return jobStatus === jobFilter.toLowerCase();
        }).length > visibleSchoolJobCount && (
          <button type="button" className="school-load-more" onClick={() => setVisibleSchoolJobCount((count) => count + 10)}>
            Load More <FiChevronDown size={13} />
          </button>
        )}
      </div>
    </div>
  );

const renderApplicantSummaryPage = (applicant = {}, job = {}) => {
  const toApplicantList = (value) => Array.isArray(value)
    ? value.filter(Boolean)
    : String(value || "").split(/[,;\n|]/).map((item) => item.trim()).filter(Boolean);
  const applicantSubjects = toApplicantList(applicant.subjects || applicant.skills);
  const applicantSkills = toApplicantList(applicant.skills || applicant.subjects);
  const applicantQualifications = toApplicantList(applicant.qualifications || applicant.qualification || applicant.education);
  const applicantExperience = Array.isArray(applicant.teaching_experience)
    ? applicant.teaching_experience
    : Array.isArray(applicant.work_experience) ? applicant.work_experience : [];
  const applicantId = applicant.application_id || applicant.id;
  const jobId = job.job_id || job.id;
  const summary = applicant.summary || applicant.bio || applicant.about || "No professional summary has been provided.";
  const cvUrl = toAssetUrl(applicant.cv_url || applicant.cv || "");
  const coverLetter = String(applicant.cover_letter || "").trim();
  const additionalInfo = String(applicant.additional_info || applicant.additionalInfo || "").trim();

  if (applicant) return (
    <div className="school-applicant-summary-page school-applicant-summary-page--api">
      <button type="button" className="school-summary-back-btn" onClick={() => setSelectedApplicant(null)}><FiArrowLeft /> Back</button>
      <div className="school-summary-container"><div className="school-summary-content">
        <section className="school-summary-section school-summary-section--first">
          <div className="school-summary-actions">
            <button
              type="button"
              className="school-summary-shortlist-btn"
              disabled={Boolean(String(applicant.status || '').toLowerCase().match(/shortlisted|interviewing/))}
              onClick={() => handleShortlistApplicant(applicant)}
              style={String(applicant.status || '').toLowerCase().match(/shortlisted|interviewing/) ? { opacity: 0.7, cursor: 'not-allowed', background: '#10b981', color: '#fff' } : {}}
            >
              {String(applicant.status || '').toLowerCase().match(/shortlisted|interviewing/) ? 'Shortlisted' : 'Shortlist Candidate'}
            </button>
            <button type="button" className="school-summary-reject-btn" onClick={() => openRejectApplicantModal(jobId, applicantId)}>Reject Applicant</button>
          </div>
          <div className="school-summary-summary-content"><div className="school-summary-header-title"><FiFileText className="school-summary-icon" /><h2>Professional Summary</h2></div><p className="school-summary-text">{summary}</p></div><div className="school-summary-clearfix" />
        </section>
        <div className="school-summary-grid-2col">
          <section className="school-summary-section"><div className="school-summary-section-header"><FiBook className="school-summary-icon" /><h2>Teaching Subjects</h2></div>{applicantSubjects.length ? <div className="school-summary-tags">{applicantSubjects.map((subject, index) => <span key={`${subject}-${index}`} className="school-summary-tag">{subject}</span>)}</div> : <p className="school-summary-text">No subjects provided.</p>}</section>
          <section className="school-summary-section"><div className="school-summary-section-header"><FiAward className="school-summary-icon" /><h2>Qualifications</h2></div>{applicantQualifications.length ? <div className="school-summary-qualifications">{applicantQualifications.map((qualification, index) => <div key={`${qualification}-${index}`} className="school-summary-qualification"><strong>{qualification}</strong></div>)}{(applicant.trcn_verified || applicant.trcn) && <div className="school-summary-badge-wrapper"><span className="school-summary-badge">TRCN VERIFIED</span></div>}</div> : <p className="school-summary-text">No qualifications provided.</p>}</section>
        </div>
        <section className="school-summary-section"><div className="school-summary-section-header"><FiBriefcase className="school-summary-icon" /><h2>Teaching Experience</h2></div>{applicantExperience.length ? <div className="school-summary-experience-timeline">{applicantExperience.map((experience, index) => <div key={experience.id || `${experience.role}-${index}`} className="school-summary-timeline-item"><div className={`school-summary-timeline-bullet ${index === 0 ? 'school-summary-timeline-bullet--active' : ''}`} /><div className="school-summary-job"><div className="school-summary-job-header"><div><strong>{experience.role || experience.title || 'Teaching role'}</strong><p className="school-summary-job-school">{experience.school || experience.institution || 'School not provided'}</p></div>{experience.period && <span className="school-summary-date">{experience.period}</span>}</div>{experience.description && <p className="school-summary-job-desc">{experience.description}</p>}</div></div>)}</div> : <p className="school-summary-text">No teaching experience provided.</p>}</section>
        <div className="school-summary-bottom-row"><section className="school-summary-section school-summary-section--skills"><div className="school-summary-section-header"><h2>Key Skills</h2></div>{applicantSkills.length ? <div className="school-summary-skills">{applicantSkills.map((skill, index) => <span key={`${skill}-${index}`} className="school-summary-skill-tag">{skill}</span>)}</div> : <p className="school-summary-text">No skills provided.</p>}</section><div className="school-summary-documents">{cvUrl && <div className="school-summary-document"><div className="school-summary-doc-icon-box school-summary-doc-icon-box--pdf"><span>PDF</span></div><div className="school-summary-doc-info"><p className="school-summary-doc-name">{cvUrl.split('/').pop()}</p><p className="school-summary-doc-size">CV uploaded</p></div><div className="school-summary-doc-actions"><button type="button" title="View CV" className="school-summary-doc-btn" onClick={() => window.open(cvUrl, '_blank', 'noopener,noreferrer')}><FiEye size={18} /></button><button type="button" title="Download CV" className="school-summary-doc-btn" onClick={() => window.open(cvUrl, '_blank', 'noopener,noreferrer')}><FiDownload size={18} /></button></div></div>}{coverLetter ? <div className="school-summary-cover-letter"><FiFileText /><div><strong>Cover letter</strong><p>{coverLetter}</p></div></div> : <div className="school-summary-no-cover-letter"><FiFileText /><span>No cover letter submitted</span></div>}{additionalInfo && <div className="school-summary-cover-letter"><FiInfo /><div><strong>Additional information</strong><p>{additionalInfo}</p></div></div>}</div></div>
      </div></div>
    </div>
  );

  return (
    <div className="school-applicant-summary-page">
      <button
        type="button"
        className="school-summary-back-btn"
        onClick={() => setSelectedApplicant(null)}
      >
        <FiArrowLeft /> Back
      </button>

      <div className="school-summary-container">
        <div className="school-summary-content">

          {/* 1. Professional Summary */}
          <section className="school-summary-section school-summary-section--first">

            {/* Action Buttons - Right Side */}
            <div className="school-summary-actions">
              <button
                type="button"
                className="school-summary-shortlist-btn"
                disabled={Boolean(String(applicant.status || '').toLowerCase().match(/shortlisted|interviewing/))}
                onClick={() => handleShortlistApplicant(applicant)}
                style={String(applicant.status || '').toLowerCase().match(/shortlisted|interviewing/) ? { opacity: 0.7, cursor: 'not-allowed', background: '#10b981', color: '#fff' } : {}}
              >
                {String(applicant.status || '').toLowerCase().match(/shortlisted|interviewing/) ? 'Shortlisted' : 'Shortlist Candidate'}
              </button>

              <button
                type="button"
                className="school-summary-reject-btn"
                onClick={() => openRejectApplicantModal(jobId, applicantId)}
              >
                Reject Applicant
              </button>
            </div>

            {/* Professional Summary Content */}
            <div className="school-summary-summary-content">
              <div className="school-summary-header-title">
                <FiFileText className="school-summary-icon" />
                <h2>Professional Summary</h2>
              </div>

              <p className="school-summary-text">
                {applicant.summary ||
                  "Seasoned Mathematics educator with over 12 years of experience in preparing students for WAEC, NECO, and IGCSE examinations. Proven track record of improving student performance by 35% through innovative teaching methodologies and personalized learning paths. Dedicated to fostering a deep understanding of complex mathematical concepts and further mathematics logic."}
              </p>
            </div>

            {/* Clear floated buttons */}
            <div className="school-summary-clearfix" />
          </section>

          {/* 2. Teaching Subjects & Qualifications (2-Column Grid) */}
          <div className="school-summary-grid-2col">

            <section className="school-summary-section">
              <div className="school-summary-section-header">
                <FiBook className="school-summary-icon" />
                <h2>Teaching Subjects</h2>
              </div>

              <div className="school-summary-tags">
                {applicantSubjects.map((subject, idx) => (
                  <span
                    key={idx}
                    className="school-summary-tag"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </section>

            <section className="school-summary-section">
              <div className="school-summary-section-header">
                <FiAward className="school-summary-icon" />
                <h2>Qualifications</h2>
              </div>

              <div className="school-summary-qualifications">
                <div className="school-summary-qualification">
                  <strong>B.Sc Mathematics</strong>
                  <span className="school-summary-qual-year">
                    UNILAG, 2011
                  </span>
                </div>

                <div className="school-summary-qualification">
                  <strong>M.Ed Educational Admin</strong>
                  <span className="school-summary-qual-year">
                    UI, 2015
                  </span>
                </div>

                <div className="school-summary-badge-wrapper">
                  <span className="school-summary-badge">
                    TRCN VERIFIED
                  </span>
                </div>
              </div>
            </section>

          </div>

          {/* 3. Teaching Experience */}
          <section className="school-summary-section">

            <div className="school-summary-section-header">
              <FiBriefcase className="school-summary-icon" />
              <h2>Teaching Experience</h2>
            </div>

            <div className="school-summary-experience-timeline">

              {/* Experience 1 */}
              <div className="school-summary-timeline-item">

                <div className="school-summary-timeline-bullet school-summary-timeline-bullet--active" />

                <div className="school-summary-job">

                  <div className="school-summary-job-header">
                    <div>
                      <strong>Senior Math Teacher</strong>

                      <p className="school-summary-job-school">
                        Grange School, Lagos
                      </p>
                    </div>

                    <span className="school-summary-date school-summary-date--current">
                      2018 - Present
                    </span>
                  </div>

                  <p className="school-summary-job-desc">
                    Leading the department in curriculum redesign and
                    implementing tech-enabled learning modules for
                    advanced calculus and statistics.
                  </p>

                </div>
              </div>

              {/* Experience 2 */}
              <div className="school-summary-timeline-item">

                <div className="school-summary-timeline-bullet" />

                <div className="school-summary-job">

                  <div className="school-summary-job-header">
                    <div>
                      <strong>Mathematics Educator</strong>

                      <p className="school-summary-job-school">
                        Corona Secondary School
                      </p>
                    </div>

                    <span className="school-summary-date">
                      2014 - 2018
                    </span>
                  </div>

                  <p className="school-summary-job-desc">
                    Managed standardized testing preparation and
                    extracurricular math Olympiad coaching for senior
                    students.
                  </p>

                </div>
              </div>

            </div>
          </section>

          {/* 4. Key Skills & Uploaded Documents */}
          <div className="school-summary-bottom-row">

            {/* Key Skills */}
            <section className="school-summary-section school-summary-section--skills">

              <div className="school-summary-section-header">
                <h2>Key Skills</h2>
              </div>

              <div className="school-summary-skills">
                {applicantSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="school-summary-skill-tag"
                  >
                    {skill}
                  </span>
                ))}
              </div>

            </section>

            {/* Uploaded Documents */}
            <div className="school-summary-documents">

              {/* CV */}
              <div className="school-summary-document">

                <div className="school-summary-doc-icon-box school-summary-doc-icon-box--pdf">
                  <span>PDF</span>
                </div>

                <div className="school-summary-doc-info">
                  <p className="school-summary-doc-name">
                    Tunde_Bello_CV.pdf
                  </p>

                  <p className="school-summary-doc-size">
                    1.2 MB • Updated 2 days ago
                  </p>
                </div>

                <div className="school-summary-doc-actions">

                  <button
                    type="button"
                    title="View"
                    className="school-summary-doc-btn"
                  >
                    <FiEye size={18} />
                  </button>

                  <button
                    type="button"
                    title="Download"
                    className="school-summary-doc-btn"
                  >
                    <FiDownload size={18} />
                  </button>

                </div>
              </div>

              {/* Cover Letter */}
              <div className="school-summary-document">

                <div className="school-summary-doc-icon-box school-summary-doc-icon-box--doc">
                  <FiFileText size={20} />
                </div>

                <div className="school-summary-doc-info">
                  <p className="school-summary-doc-name">
                    Cover_Letter.docx
                  </p>

                  <p className="school-summary-doc-size">
                    450 KB • Updated 2 days ago
                  </p>
                </div>

                <div className="school-summary-doc-actions">

                  <button
                    type="button"
                    title="View"
                    className="school-summary-doc-btn"
                  >
                    <FiEye size={18} />
                  </button>

                  <button
                    type="button"
                    title="Download"
                    className="school-summary-doc-btn"
                  >
                    <FiDownload size={18} />
                  </button>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

  const normalizeMultiValueList = (value) => {
    if (Array.isArray(value)) {
      return value.flatMap((item) => normalizeMultiValueList(item));
    }

    if (typeof value === "string") {
      return value
        .split(/[|,;\n]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (value && typeof value === "object") {
      return Object.values(value)
        .flatMap((item) => normalizeMultiValueList(item));
    }

    return [];
  };

  const renderTeacherProfileSummaryPage = (teacher = {}) => {
    const profileName = teacher.name || teacher.full_name || teacher.teacher_name || "Teacher";
    const summary = teacher.summary || teacher.bio || teacher.about || "";
    const subjectList = normalizeMultiValueList(teacher.subjects || teacher.subject || teacher.teaching_subjects || teacher.subjects_offered);
    const skillList = normalizeMultiValueList(teacher.skills || teacher.key_skills || teacher.skillset || teacher.specialties);
    const qualificationList = normalizeMultiValueList(teacher.qualifications || teacher.qualification || teacher.education || teacher.certifications);
    const experienceText = teacher.experience || teacher.experience_years ? `${teacher.experience || teacher.experience_years} Years` : "";
    const cvUrl = toAssetUrl(teacher.cv_url || teacher.cvUrl || teacher.cv || "");
    const cvFileName = cvUrl ? cvUrl.split("/").pop() || "Teacher_CV.pdf" : "";

    return (
      <div className="school-applicant-summary-page">
        <button
          type="button"
          className="school-summary-back-btn"
          onClick={() => setSelectedTeacherProfile(null)}
        >
          <FiArrowLeft /> Back
        </button>

        <div className="school-summary-container">
          <div className="school-summary-content">
            <section className="school-summary-section school-summary-section--first">
              <div className="school-summary-actions">
                <button
                  type="button"
                  className="school-summary-shortlist-btn"
                  onClick={() => setIsTeacherInviteModalOpen(true)}
                >
                  Invite
                </button>
                <button
                  type="button"
                  className="school-summary-reject-btn"
                  onClick={() => handleToggleSavedTeacher(teacher)}
                >
                  {savedTeacherIds.includes(String(teacher.teacher_id || teacher.user_id || teacher.id || teacher.teacherUserId || teacher.application_id)) ? 'Saved' : 'Save Teacher'}
                </button>
              </div>

              <div className="school-summary-summary-content">
                <div className="school-summary-header-title">
                  <FiFileText className="school-summary-icon" />
                  <h2>Professional Summary</h2>
                </div>

                <p className="school-summary-text">
                  {summary || `${profileName} has not added a professional summary yet.`}
                </p>
              </div>

              <div className="school-summary-clearfix" />
            </section>

            <div className="school-summary-grid-2col">
              <section className="school-summary-section">
                <div className="school-summary-section-header">
                  <FiBook className="school-summary-icon" />
                  <h2>Teaching Subjects</h2>
                </div>

                {subjectList.length ? (
                  <div className="school-summary-tags">
                    {subjectList.filter(Boolean).map((subject, idx) => (
                      <span key={`${subject}-${idx}`} className="school-summary-tag">
                        {subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="school-summary-text">No subjects listed.</p>
                )}
              </section>

              <section className="school-summary-section">
                <div className="school-summary-section-header">
                  <FiAward className="school-summary-icon" />
                  <h2>Qualifications</h2>
                </div>

                {qualificationList.length ? (
                  <div className="school-summary-qualifications">
                    {qualificationList.filter(Boolean).slice(0, 3).map((qualification, idx) => (
                      <div key={`${qualification}-${idx}`} className="school-summary-qualification">
                        <strong>{qualification}</strong>
                        <span className="school-summary-qual-year">{teacher.location || "Location not set"}</span>
                      </div>
                    ))}

                    {teacher.trcn_verified || teacher.trcn ? (
                      <div className="school-summary-badge-wrapper">
                        <span className="school-summary-badge">{teacher.trcn_verified || teacher.trcn}</span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="school-summary-text">No qualifications listed.</p>
                )}
              </section>
            </div>

            <section className="school-summary-section">
              <div className="school-summary-section-header">
                <FiBriefcase className="school-summary-icon" />
                <h2>Teaching Experience</h2>
              </div>

              {Array.isArray(teacher.experience_items) && teacher.experience_items.length ? (
                <div className="school-summary-experience-timeline">
                  {teacher.experience_items.map((item, idx) => (
                    <div key={`${item.title || 'experience'}-${idx}`} className="school-summary-timeline-item">
                      <div className="school-summary-timeline-bullet school-summary-timeline-bullet--active" />
                      <div className="school-summary-job">
                        <div className="school-summary-job-header">
                          <div>
                            <strong>{item.title || "Teacher"}</strong>
                            <p className="school-summary-job-school">{item.school || "School not set"}</p>
                          </div>
                          <span className="school-summary-date school-summary-date--current">
                            {item.period || experienceText || "Not provided"}
                          </span>
                        </div>
                        <p className="school-summary-job-desc">{item.description || summary || "No experience details provided."}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="school-summary-text">
                  {experienceText ? `Experience: ${experienceText}` : "No teaching experience added yet."}
                </p>
              )}
            </section>

            <div className="school-summary-bottom-row">
              <section className="school-summary-section school-summary-section--skills">
                <div className="school-summary-section-header">
                  <h2>Key Skills</h2>
                </div>

                {skillList.length ? (
                  <div className="school-summary-skills">
                    {skillList.filter(Boolean).map((skill, idx) => (
                      <span key={`${skill}-${idx}`} className="school-summary-skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="school-summary-text">No skills listed.</p>
                )}
              </section>

              {cvUrl ? (
                <div className="school-summary-documents">
                  <div className="school-summary-document">
                    <div className="school-summary-doc-icon-box school-summary-doc-icon-box--pdf">
                      <span>PDF</span>
                    </div>
                    <div className="school-summary-doc-info">
                      <p className="school-summary-doc-name">{cvFileName}</p>
                      <p className="school-summary-doc-size">CV uploaded</p>
                    </div>
                    <div className="school-summary-doc-actions">
                      <button type="button" title="View" className="school-summary-doc-btn" onClick={() => window.open(cvUrl, "_blank", "noopener,noreferrer")}><FiEye size={18} /></button>
                      <button type="button" title="Download" className="school-summary-doc-btn" onClick={() => window.open(cvUrl, "_blank", "noopener,noreferrer")}><FiDownload size={18} /></button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderJobApplicantsPage = (job) => {
    if (selectedApplicant) {
      return renderApplicantSummaryPage(selectedApplicant, job);
    }

    const jobId = job.job_id || job.id;
    const applicants = applicantsByJob[jobId] || [];

    const statusFilters = [
      "All",
      "Under Review",
      "Shortlisted",
      "Rejected",
    ];

    const filteredApplicants = applicants.filter((app) => {
      const status = getApplicantDisplayStatus(app);
      const experience = String(app.experience || "");
      const qualification = String(app.qualification || "");

      const matchesStatus = (() => {
        switch (applicantFilter) {
          case "Under Review":
            return status === "under review" || status === "reviewed";
          case "Shortlisted":
            return status === "shortlisted";
          case "Rejected":
            return status === "rejected";
          case "All":
          default:
            return true;
        }
      })();

      const matchesExperience =
        experienceFilter === "Experience" ||
        (experienceFilter === "3+ years" && experience.includes("3")) ||
        (experienceFilter === "5+ years" && experience.includes("5")) ||
        (experienceFilter === "8+ years" && experience.includes("8")) ||
        (experienceFilter === "15+ years" && experience.includes("15"));

      const matchesQualification =
        qualificationFilter === "Qualification" ||
        (qualificationFilter === "M.Ed" && qualification.includes("M.Ed")) ||
        (qualificationFilter === "B.Sc" && qualification.includes("B.Sc")) ||
        (qualificationFilter === "PhD" && qualification.includes("PhD"));

      return matchesStatus && matchesExperience && matchesQualification;
    });

    const applicantsPerPage = 3;
    const totalApplicantCount = filteredApplicants.length;
    const totalApplicantPages = Math.max(1, Math.ceil(totalApplicantCount / applicantsPerPage));
    const safeApplicantPage = Math.min(Math.max(1, applicantPage), totalApplicantPages);
    const applicantPageStart = (safeApplicantPage - 1) * applicantsPerPage;
    const paginatedApplicants = filteredApplicants.slice(
      applicantPageStart,
      applicantPageStart + applicantsPerPage,
    );

    const paginationItems = (() => {
      if (totalApplicantPages <= 7) {
        return Array.from({ length: totalApplicantPages }, (_, index) => index + 1);
      }

      if (safeApplicantPage <= 3) {
        return [1, 2, 3, "…", totalApplicantPages];
      }

      if (safeApplicantPage >= totalApplicantPages - 2) {
        return [1, "…", totalApplicantPages - 2, totalApplicantPages - 1, totalApplicantPages];
      }

      return [1, "…", safeApplicantPage - 1, safeApplicantPage, safeApplicantPage + 1, "…", totalApplicantPages];
    })();

    return (
      <div className="school-job-applicants-page">
        <div className="school-job-applicants-breadcrumb">
          <button type="button" onClick={() => setSelectedJob(null)}>
            Jobs
          </button>
          <span>›</span>
          <strong>{job.title || "Job position"}</strong>
        </div>

        <h2 className="school-job-applicants-title">Applicants List</h2>
        <p className="school-job-applicants-subtitle">
          Reviewing {applicants.length} candidates for the{" "}
          {job.title || "this job"} position
        </p>

        <div className="school-job-applicants-toolbar">
          <div className="school-job-applicants-filters">
            {statusFilters.map((filter) => (
              <button
                type="button"
                key={filter}
                className={applicantFilter === filter ? "is-active" : ""}
                onClick={() => {
                  setApplicantFilter(filter);
                  setApplicantPage(1);
                }}
              >
                {filter === "All" ? `All (${applicants.length})` : filter}
              </button>
            ))}

            <div className="school-job-filter-menu-wrap">
              <button
                type="button"
                className="school-job-filter-button"
                onClick={() => setExperienceMenuOpen(!experienceMenuOpen)}
              >
                {experienceFilter} <span>▾</span>
              </button>
              {experienceMenuOpen && (
                <div className="school-job-filter-menu">
                  {[
                    "Experience",
                    "3+ years",
                    "5+ years",
                    "8+ years",
                    "15+ years",
                  ].map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => {
                        setExperienceFilter(option);
                        setExperienceMenuOpen(false);
                        setApplicantPage(1);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="school-job-filter-menu-wrap">
              <button
                type="button"
                className="school-job-filter-button"
                onClick={() => setQualificationMenuOpen(!qualificationMenuOpen)}
              >
                {qualificationFilter} <span>▾</span>
              </button>
              {qualificationMenuOpen && (
                <div className="school-job-filter-menu">
                  {[
                    "Qualification",
                    "M.Ed",
                    "B.Sc",
                    "PhD",
                  ].map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => {
                        setQualificationFilter(option);
                        setQualificationMenuOpen(false);
                        setApplicantPage(1);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            className="school-job-clear-filters"
            onClick={() => {
              setApplicantFilter("All");
              setExperienceFilter("Experience");
              setQualificationFilter("Qualification");
              setExperienceMenuOpen(false);
              setQualificationMenuOpen(false);
              setApplicantPage(1);
            }}
          >
            Clear all
          </button>
        </div>

        <div className="school-job-applicants-list">
          {paginatedApplicants.length === 0 && (
            <p className="school-job-applicants-empty">No applicants match the selected filters.</p>
          )}
          {paginatedApplicants.map((app, index) => {
            const appId = app.application_id || app.id || index;
            const currentStatus = getApplicantDisplayStatus(app);
            const statusMap = {
              shortlisted: "SHORTLISTED",
              "under review": "UNDER REVIEW",
              pending: "PENDING",
              rejected: "REJECTED",
              hired: "HIRED",
            };
            const displayStatus = statusMap[currentStatus] || "PENDING";

            return (
              <div className="school-job-applicant-card" key={appId}>
                <div className="school-job-applicant-main">
                  <div className="school-job-applicant-name-block">
                    <h4>
                      {app.teacher_name || app.teacher_email || "Applicant"}
                    </h4>
                    <div className="school-job-applicant-role">
                      {app.role_title || job.role_type || "Not provided"}
                    </div>
                    {app.experience || app.experience_years ? (
                      <div className="school-job-applicant-meta-row">
                        <span className="school-job-applicant-badge">
                          {app.experience || `${app.experience_years} years`}
                        </span>
                        {app.trcn || app.verified ? (
                          <span className="school-job-applicant-badge school-job-applicant-badge--green">
                            TRCN
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="school-job-applicant-column">
                    <span className="school-job-applicant-label">
                      Qualification
                    </span>
                    <strong>{app.qualification || app.education || "Not provided"}</strong>
                  </div>

                  <div className="school-job-applicant-column">
                    <span className="school-job-applicant-label">Location</span>
                    <strong>
                      <span className="school-job-location-pin">◌</span>
                      {app.location || "Not provided"}
                    </strong>
                  </div>

                  <div className="school-job-applicant-column school-job-applicant-column--status">
                    <span className="school-job-applicant-label">Status</span>
                    <span
                      className={`school-job-applicant-status school-job-applicant-status--${currentStatus.replace(/\s+/g, "-")}`}
                    >
                      {displayStatus}
                    </span>
                    {app.interview ? (
                      <small className="school-job-applicant-interview">
                        {app.interview.interview_date || "Date not provided"} at {app.interview.interview_time || "Time not provided"}
                        <br />
                        {app.interview.venue || app.interview.meeting_link || "Location not provided"}
                      </small>
                    ) : null}
                  </div>
                </div>

                <div className="school-job-applicant-actions">
                  <button
                    type="button"
                    className="school-job-applicant-view-btn"
                    onClick={() => setSelectedApplicant(app)}
                  >
                    View Application
                  </button>
                  <div className="school-job-applicant-more-wrap">
                    <button
                      type="button"
                      className="school-job-applicant-more"
                      aria-label="Applicant options"
                      onClick={() =>
                        setOpenApplicantMenuId(
                          openApplicantMenuId === appId ? null : appId,
                        )
                      }
                    >
                      ⋮
                    </button>
                    {openApplicantMenuId === appId && (
                      <div className="school-job-applicant-menu">
                        <button
                          type="button"
                          disabled={currentStatus === "shortlisted"}
                          onClick={() => handleShortlistApplicant(app)}
                        >
                          <span className="school-job-applicant-menu-icon">
                            <FiCheckCircle size={18} />
                          </span>
                          <span>{currentStatus === "shortlisted" ? "Shortlisted" : "Shortlist"}</span>
                        </button>
                        <button
                          type="button"
                          className="school-job-applicant-menu-delete"
                          onClick={() => openRejectApplicantModal(jobId, appId)}
                        >
                          <span className="school-job-applicant-menu-icon">
                            <FiX size={18} />
                          </span>
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="school-job-applicants-footer">
          <span>
            Showing {Math.min(filteredApplicants.length, applicantPageStart + 1)}-
            {Math.min(filteredApplicants.length, applicantPageStart + paginatedApplicants.length)} of {totalApplicantCount} applicants
          </span>
          <div className="school-job-applicant-pagination">
            <button
              type="button"
              className="school-job-pager-nav"
              onClick={() => setApplicantPage((current) => Math.max(current - 1, 1))}
              disabled={safeApplicantPage === 1}
            >
              ‹
            </button>
            {paginationItems.map((pageNumber, index) =>
              pageNumber === "…" ? (
                <button key={`ellipsis-${index}`} type="button" disabled>
                  …
                </button>
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  className={safeApplicantPage === pageNumber ? "is-active" : ""}
                  onClick={() => setApplicantPage(Number(pageNumber))}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              className="school-job-pager-nav"
              onClick={() => setApplicantPage((current) => Math.min(current + 1, totalApplicantPages))}
              disabled={safeApplicantPage === totalApplicantPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleViewTeacherProfile = async (teacher) => {
    const teacherId = teacher?.user_id || teacher?.teacher_id || teacher?.id || teacher?.teacherId;

    if (!teacherId) {
      setSelectedTeacherProfile(teacher);
      return;
    }

    try {
      const response = await adminService.getTeacherById(teacherId);
      const payload = response?.data?.data ?? response?.data ?? {};
      const detail = Array.isArray(payload)
        ? payload[0] ?? teacher
        : payload?.teacher ?? payload?.profile ?? payload?.user ?? payload ?? teacher;

      const merged = {
        ...teacher,
        ...detail,
        ...(detail?.user || {}),
        ...(detail?.profile || {}),
        name:
          teacher?.name ||
          detail?.full_name ||
          detail?.teacher_name ||
          detail?.user?.full_name ||
          "Teacher",
        full_name:
          teacher?.full_name ||
          detail?.full_name ||
          detail?.teacher_name ||
          detail?.user?.full_name ||
          teacher?.name ||
          "Teacher",
        subject: teacher?.subject || detail?.subject || detail?.role_title || "",
        skills: teacher?.skills || detail?.skills || detail?.profile?.skills || detail?.key_skills || detail?.skillset || [],
        summary: teacher?.summary || detail?.bio || detail?.about || detail?.profile?.bio || "",
        experience: teacher?.experience || detail?.experience || detail?.experience_years || "",
        location: teacher?.location || detail?.location || detail?.state || "",
        cv_url: teacher?.cv_url || detail?.cv_url || detail?.profile?.cv_url || detail?.cv || "",
      };

      setSelectedTeacherProfile(merged);
    } catch (_err) {
      setSelectedTeacherProfile(teacher);
    }
  };

  const handleSendTeacherInvite = async () => {
    const teacherId = selectedTeacherProfile?.teacher_id || selectedTeacherProfile?.user_id || selectedTeacherProfile?.id;
    const message = teacherInviteMessage.trim();

    if (!teacherId) {
      showSnackbar("Unable to invite teacher", "This teacher profile is missing a valid ID.");
      return;
    }

    if (!message) {
      showSnackbar("Invitation message required", "Please add a short invitation message before sending.");
      return;
    }

    try {
      setTeacherInviteSubmitting(true);
      await profileService.inviteTeacher(teacherId, {
        message,
      });
      setIsTeacherInviteModalOpen(false);
      setTeacherInviteMessage(
        "Hi there, we were impressed by your profile and would love for you to apply for one of our open teaching opportunities. We would be delighted to discuss the role with you and learn more about your experience.",
      );
      showSnackbar("Invitation Sent", `${selectedTeacherProfile?.name || selectedTeacherProfile?.full_name || "Teacher"} has been invited to apply.`);
    } catch (err) {
      showSnackbar("Invitation failed", apiErrorMessage(err, "Unable to send this invitation right now."));
    } finally {
      setTeacherInviteSubmitting(false);
    }
  };

  const renderTeacherInviteModal = () => {
    const teacherName = selectedTeacherProfile?.name || selectedTeacherProfile?.full_name || "Teacher";
    const teacherRole = selectedTeacherProfile?.role || selectedTeacherProfile?.subject || "Teacher";
    const teacherAvailability = selectedTeacherProfile?.experience || "Experience available";

    return (
      <div
        className="school-teacher-invite-backdrop"
        onClick={() => setIsTeacherInviteModalOpen(false)}
        role="presentation"
      >
        <div
          className="school-teacher-invite-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="teacher-invite-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <h3 id="teacher-invite-modal-title" className="school-teacher-invite-title">
            Invite to Apply
          </h3>

          <p className="school-teacher-invite-subtitle">
            Send an invitation to <strong>{teacherName}</strong> on behalf of <strong>{user?.school_name || user?.full_name || "Your school"}</strong>.
          </p>

          <div className="school-teacher-invite-profile-card">
            <div className="school-teacher-invite-avatar" aria-hidden="true">
              {teacherName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="school-teacher-invite-profile-copy">
              <div className="school-teacher-invite-name-row">
                <span className="school-teacher-invite-name">{teacherName}</span>
              </div>
              <p className="school-teacher-invite-role">{teacherRole}</p>
              <div className="school-teacher-invite-meta-wrap">
                <span className="school-teacher-invite-pill">AVAILABLE</span>
                <span className="school-teacher-invite-meta">{teacherAvailability}</span>
              </div>
            </div>
          </div>

          <div className="school-teacher-invite-school-block">
            <p className="school-teacher-invite-label">SENDING ON BEHALF OF</p>
            <div className="school-teacher-invite-school-row">
              <span className="school-teacher-invite-school-badge" aria-label="School icon" role="img">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 3.5 3 8l9 4.5L21 8l-9-4.5Zm-7 6.3v4.28c0 1.1 2.69 2.42 7 2.42s7-1.32 7-2.42V9.8l-7 3.5-7-3.5Zm8.5 5.7v2.5h-1v-2.5a8.83 8.83 0 0 1-5.5-2.2v1.4c0 1.9 3.3 3.6 7 3.6s7-1.7 7-3.6v-1.4a8.83 8.83 0 0 1-5.5 2.2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>{user?.school_name || user?.full_name || "Your school"}</span>
            </div>
          </div>

          <div className="school-teacher-invite-details-block">
            <p className="school-teacher-invite-label">DETAILS</p>
            <textarea
              className="school-teacher-invite-textarea"
              rows="5"
              value={teacherInviteMessage}
              onChange={(event) => setTeacherInviteMessage(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="school-teacher-invite-send-btn"
            onClick={handleSendTeacherInvite}
            disabled={teacherInviteSubmitting}
          >
            {teacherInviteSubmitting ? "Sending..." : "Send Invite"}
          </button>

          <button
            type="button"
            className="school-teacher-invite-cancel-btn"
            onClick={() => setIsTeacherInviteModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderRejectModal = () => (
    isRejectModalOpen && (
      <div className="school-shortlist-modal-backdrop" onClick={() => setIsRejectModalOpen(false)}>
        <div className="school-shortlist-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
          <div className="school-shortlist-modal-header">
            <div className="school-shortlist-modal-heading">
              <h3 id="reject-modal-title">Reject Application</h3>
            </div>
            <button type="button" className="school-shortlist-modal-close" onClick={() => setIsRejectModalOpen(false)} aria-label="Close reject modal">×</button>
          </div>

          <div className="school-shortlist-modal-body">
            <label className="school-shortlist-field" style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#20252b' }}>Please provide a reason/message to the candidate.</span>
              <textarea
                rows={6}
                value={rejectMessage}
                onChange={(event) => setRejectMessage(event.target.value)}
                placeholder="We appreciate your interest, but we have decided to move forward with other candidates."
                style={{ width: '100%', resize: 'vertical', border: '1px solid #d8e1d7', borderRadius: '12px', padding: '12px 14px', font: 'inherit' }}
              />
            </label>

            {rejectError && (
              <p className="school-shortlist-error" role="alert">{rejectError}</p>
            )}
          </div>

          <div className="school-shortlist-modal-actions">
            <button type="button" className="school-shortlist-cancel-btn" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="school-shortlist-confirm-btn" onClick={handleRejectApplicant} disabled={rejectSubmitting}>
              {rejectSubmitting ? "Rejecting..." : "Reject Application"}
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderShortlistModal = () => {
    const isAlreadyShortlisted =
      String(selectedApplicant?.status || "").toLowerCase() === "shortlisted";
    const modalSubtitle =
      selectedApplicant?.teacher_name || "Applicant";

    return (
      <div
        className="school-shortlist-modal-backdrop"
        onClick={() => setIsShortlistModalOpen(false)}
        role="presentation"
      >
        <div
          className="school-shortlist-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortlist-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="school-shortlist-modal-header">
            <div className="school-shortlist-modal-heading">
              <h3 id="shortlist-modal-title">Shortlist Candidate</h3>
              {isAlreadyShortlisted && (
                <p className="school-shortlist-modal-subtitle">
                  Update status for {modalSubtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              className="school-shortlist-modal-close"
              onClick={() => setIsShortlistModalOpen(false)}
              aria-label="Close shortlist modal"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="school-shortlist-modal-body">
            {isAlreadyShortlisted ? (
              <>
                <div className="school-shortlist-status-row">
                  <div className="school-shortlist-status-box">
                    <span className="school-shortlist-status-label">
                      Application Status
                    </span>
                    <div className="school-shortlist-status-pill">
                      <span className="school-shortlist-status-dot" />
                      SHORTLISTED
                    </div>
                  </div>

                  <div className="school-shortlist-status-box">
                    <span className="school-shortlist-status-label">
                      Interview Stage
                    </span>
                    <select
                      className="school-shortlist-status-select"
                      value={shortlistForm.interviewType}
                      onChange={(event) =>
                        setShortlistForm((prev) => ({
                          ...prev,
                          interviewType: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select interview type</option>
                      <option value="Physical Interview">Physical Interview</option>
                      <option value="Virtual Interview">Virtual Interview</option>
                    </select>
                  </div>
                </div>

                <div className="school-shortlist-interview-details">
                  <div className="school-shortlist-interview-header">
                    <span className="school-shortlist-calendar-icon">▣</span>
                    <h4>Interview Details</h4>
                  </div>

                  <div className="school-shortlist-details-grid">
                    <div className="school-shortlist-detail-block">
                      <label>Date</label>
                      <input
                        type="date"
                        value={shortlistForm.interviewDate}
                        onChange={(event) =>
                          setShortlistForm((prev) => ({
                            ...prev,
                            interviewDate: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="school-shortlist-detail-block">
                      <label>Time</label>
                      <input
                        type="time"
                        value={shortlistForm.interviewTime}
                        onChange={(event) =>
                          setShortlistForm((prev) => ({
                            ...prev,
                            interviewTime: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="school-shortlist-detail-block school-shortlist-detail-block--wide school-shortlist-detail-block--link-row">
                      <label>Venue / Meeting Link</label>
                      <div className="school-shortlist-input-wrap">
                        <span className="school-shortlist-link-icon">◫</span>
                        <input
                          type="text"
                          value={shortlistForm.interviewLink}
                          placeholder="Meeting link"
                          onChange={(event) =>
                            setShortlistForm((prev) => ({
                              ...prev,
                              interviewLink: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="school-shortlist-detail-block school-shortlist-detail-block--wide">
                      <label>Additional Instructions</label>
                      <input
                        type="text"
                        value={shortlistForm.additionalInstructions || ""}
                        placeholder="e.g. Please bring a copy of your portfolio"
                        onChange={(event) =>
                          setShortlistForm((prev) => ({
                            ...prev,
                            additionalInstructions: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <label className="school-shortlist-field">
                  <span>Interview Type</span>
                  <select
                    value={shortlistForm.interviewType}
                    onChange={(event) =>
                      setShortlistForm((prev) => ({
                        ...prev,
                        interviewType: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select</option>
                    <option value="Physical Interview">Physical Interview</option>
                    <option value="Virtual Interview">Virtual Interview</option>
                  </select>
                </label>

                {(shortlistForm.interviewType === "Physical Interview" ||
                  shortlistForm.interviewType === "Virtual Interview") && (
                  <div className="school-shortlist-interview-details">
                    <div className="school-shortlist-interview-header">
                      <span className="school-shortlist-calendar-icon">▣</span>
                      <h4>Interview Details</h4>
                    </div>

                    <div className="school-shortlist-details-grid">
                      <div className="school-shortlist-detail-block">
                        <label>Date</label>
                        <input
                          type="date"
                          value={shortlistForm.interviewDate}
                          onChange={(event) =>
                            setShortlistForm((prev) => ({
                              ...prev,
                              interviewDate: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="school-shortlist-detail-block">
                        <label>Time</label>
                        <input
                          type="time"
                          value={shortlistForm.interviewTime}
                          onChange={(event) =>
                            setShortlistForm((prev) => ({
                              ...prev,
                              interviewTime: event.target.value,
                            }))
                          }
                        />
                      </div>

                      {shortlistForm.interviewType === "Physical Interview" ? (
                        <>
                          <div className="school-shortlist-detail-block school-shortlist-detail-block--wide">
                            <label>Venue</label>
                            <div className="school-shortlist-input-wrap school-shortlist-input-wrap--venue">
                              <span className="school-shortlist-location-dot">◉</span>
                              <input
                                type="text"
                                value={shortlistForm.interviewVenue}
                                onChange={(event) =>
                                  setShortlistForm((prev) => ({
                                    ...prev,
                                    interviewVenue: event.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>

                          <div className="school-shortlist-detail-block school-shortlist-detail-block--right">
                            <label>Recipient contact</label>
                            <input
                              type="text"
                              className="school-shortlist-recipient-input"
                              placeholder="Name"
                              value={shortlistForm.recipientName}
                              readOnly
                            />
                            <input
                              type="tel"
                              className="school-shortlist-recipient-input"
                              placeholder="Phone Number"
                              value={shortlistForm.recipientPhone}
                              readOnly
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="school-shortlist-detail-block school-shortlist-detail-block--wide">
                            <label>Link</label>
                            <div className="school-shortlist-input-wrap school-shortlist-input-wrap--link">
                              <span className="school-shortlist-link-icon">◫</span>
                              <input
                                type="text"
                                value={shortlistForm.interviewLink}
                                onChange={(event) =>
                                  setShortlistForm((prev) => ({
                                    ...prev,
                                    interviewLink: event.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>

                          <div className="school-shortlist-detail-block school-shortlist-detail-block--right">
                            <label>Recipient contact</label>
                            <input
                              type="text"
                              className="school-shortlist-recipient-input"
                              placeholder="Name"
                              value={shortlistForm.recipientName}
                              readOnly
                            />
                            <input
                              type="tel"
                              className="school-shortlist-recipient-input"
                              placeholder="Phone Number"
                              value={shortlistForm.recipientPhone}
                              readOnly
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="school-shortlist-field school-shortlist-field--template">
              <div className="school-shortlist-template-header">
                <span>Response Template</span>
                <button
                  type="button"
                  className="school-shortlist-template-action"
                  onClick={() =>
                    setShortlistForm((prev) => ({
                      ...prev,
                      responseTemplate: "Manage Templates",
                    }))
                  }
                >
                  <span className="school-shortlist-gear">⚙</span>
                  <span>Manage Templates</span>
                </button>
              </div>

              <div
                className="school-shortlist-template-select"
                role="button"
                tabIndex={0}
                onClick={() => setShowTemplateMenu((prev) => !prev)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setShowTemplateMenu((prev) => !prev);
                  }
                }}
              >
                <span className="school-shortlist-template-value">
                  {shortlistForm.responseTemplate ||
                    "Select a saved template (optional)"}
                </span>
                <span className="school-shortlist-dropdown-caret" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>

              {showTemplateMenu && (
                <div className="school-shortlist-template-menu" role="listbox" aria-label="Saved response templates">
                  <button
                    type="button"
                    className="school-shortlist-template-option"
                    onClick={() => {
                      setShortlistForm((prev) => ({
                        ...prev,
                        responseTemplate: "",
                      }));
                      setShowTemplateMenu(false);
                    }}
                  >
                    Select a saved template (optional)
                  </button>
                  <button
                    type="button"
                    className="school-shortlist-template-option"
                    onClick={() => {
                      setShortlistForm((prev) => ({
                        ...prev,
                        responseTemplate: "Senior Literature Interview Invitation",
                      }));
                      setShowTemplateMenu(false);
                    }}
                  >
                    Senior Literature Interview Invitation
                  </button>
                  <button
                    type="button"
                    className="school-shortlist-template-option"
                    onClick={() => {
                      setShortlistForm((prev) => ({
                        ...prev,
                        responseTemplate: "Math Teacher Interview Invitation",
                      }));
                      setShowTemplateMenu(false);
                    }}
                  >
                    Math Teacher Interview Invitation
                  </button>
                </div>
              )}
            </div>

            <label className="school-shortlist-field">
              <span>Candidate Message (Optional)</span>
              <textarea
                rows="6"
                value={shortlistForm.candidateMessage}
                onChange={(event) =>
                  setShortlistForm((prev) => ({
                    ...prev,
                    candidateMessage: event.target.value,
                  }))
                }
              />
            </label>

            <div style={{ border: '1px solid #d8e9dd', borderRadius: '14px', overflow: 'hidden', background: '#f8fcf9' }}>
              <div style={{ padding: '12px 16px', background: '#0d4e2e', color: '#fff', fontWeight: 700 }}>Staffroom Interview Invitation</div>
              <div style={{ padding: '16px', color: '#334155', fontSize: '13px', lineHeight: 1.6 }}>
                <strong>Dear {shortlistForm.recipientName || 'Candidate'},</strong>
                <p style={{ whiteSpace: 'pre-wrap', margin: '10px 0 0' }}>{shortlistForm.candidateMessage || 'Your interview details will appear here.'}</p>
                <small style={{ color: '#64748b' }}>Sent by {user?.school_name || user?.full_name || 'Your school'} via Staffroom</small>
              </div>
            </div>

            {shortlistError && (
              <p className="school-shortlist-error" role="alert">{shortlistError}</p>
            )}

            <label className="school-shortlist-save-template">
              <input
                type="checkbox"
                checked={shortlistForm.saveTemplate}
                onChange={(event) =>
                  setShortlistForm((prev) => ({
                    ...prev,
                    saveTemplate: event.target.checked,
                  }))
                }
              />
              <span>Save this message as a reusable template</span>
            </label>

            <div className="school-shortlist-modal-actions">
              <button
                type="button"
                className="school-shortlist-cancel-btn"
                onClick={() => setIsShortlistModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="school-shortlist-confirm-btn"
                onClick={handleConfirmShortlist}
                disabled={shortlistSubmitting}
              >
                {shortlistSubmitting ? "Sending..." : "Confirm Shortlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderShortlistSuccessModal = () => {
    const successName = selectedApplicant?.teacher_name || "Candidate";

    return (
      <div
        className="school-shortlist-success-backdrop"
        role="presentation"
        onClick={() => setIsShortlistSuccessOpen(false)}
      >
        <div
          className="school-shortlist-success-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortlist-success-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="school-shortlist-success-icon-wrap">
            <div className="school-shortlist-success-icon">
              <FiCheck size={46} />
            </div>
          </div>

          <h3 id="shortlist-success-title">Shortlist Updated Successfully</h3>

          <p className="school-shortlist-success-text">
            {successName} has been notified. The application status is now
            <span> Shortlisted</span>
          </p>

          <div className="school-shortlist-success-actions">
            <button
              type="button"
              className="school-shortlist-success-primary"
              onClick={() => {
                setIsShortlistSuccessOpen(false);
                setSelectedApplicant(null);
                handleTabChange("applicants");
              }}
            >
              Return to Applicants
              <FiArrowRight size={16} />
            </button>
            <button
              type="button"
              className="school-shortlist-success-secondary"
              onClick={() => setIsShortlistSuccessOpen(false)}
            >
              View Teacher Profile
            </button>
          </div>

          <div className="school-shortlist-success-notice">
            <span className="school-shortlist-success-check">
              <FiCheck size={16} />
            </span>
            <div>
              <strong>Notification Sent</strong>
              <p>An email and SMS alert were sent to the candidate.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const loadSavedTeachers = async () => {
    try {
      const response = await featureService.getSavedTeachers();
      const payload = response?.data?.data ?? response?.data ?? {};
      const rawList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.saved_teachers)
          ? payload.saved_teachers
          : Array.isArray(payload.data)
            ? payload.data
            : [];
      const savedIds = rawList
        .map((item) => item?.teacher_user_id ?? item?.teacherId ?? item?.user_id ?? item?.teacher_id ?? item?.id ?? item?.teacher?.user_id ?? item?.teacherUserId)
        .filter(Boolean)
        .map((value) => String(value));
      setSavedTeacherIds([...new Set(savedIds)]);
    } catch (_err) {
      setSavedTeacherIds([]);
    }
  };

  const handleToggleSavedTeacher = async (teacher) => {
    const teacherUserId = teacher?.teacher_id || teacher?.user_id || teacher?.id || teacher?.teacherUserId || teacher?.application_id;
    if (!teacherUserId) return;

    const teacherId = String(teacherUserId);
    const isSaved = savedTeacherIds.includes(teacherId);

    try {
      if (isSaved) {
        await featureService.deleteSavedTeacher(teacherId);
        setSavedTeacherIds((prev) => prev.filter((id) => id !== teacherId));
        showSnackbar("Teacher removed", `${teacher?.name || "Teacher"} was removed from saved teachers.`);
      } else {
        await featureService.saveTeacher(teacherId);
        setSavedTeacherIds((prev) => [...new Set([...prev, teacherId])]);
        showSnackbar("Teacher saved", `${teacher?.name || "Teacher"} was saved to your shortlist.`);
      }
    } catch (err) {
      showSnackbar("Unable to update saved teachers", apiErrorMessage(err, "Unable to update this teacher."));
    }
  };

  const handleTeacherSearch = () => {
    setTeacherSearchSubmitted(teacherSearch.trim());
    setTeacherLocationMenuOpen(false);
    setTeacherExperienceMenuOpen(false);
    setTeacherSubjectMenuOpen(false);
    setTeacherTrcnMenuOpen(false);
  };

  const renderApplicants = () => {
    const accentColors = ["#d8ede5", "#e6f1ec", "#f3e7d3", "#dfeaf9", "#e7f3e8", "#f0e6f6", "#fce4d6"];

    const teacherUsers = (allUsers || [])
      .filter((userEntry) => String(userEntry?.role || "").toLowerCase() === "teacher")
      .map((userEntry, index) => ({
        name: userEntry?.full_name || userEntry?.email || `Teacher ${index + 1}`,
        role: userEntry?.role_title || userEntry?.subject || "Teacher",
        location: userEntry?.location || userEntry?.state || "Nigeria",
        experience: userEntry?.experience || userEntry?.experience_years || "Not specified",
        subject: userEntry?.subject || userEntry?.role_title || "General",
        availability: userEntry?.availability || "Available",
        trcnStatus: userEntry?.trcn_status || (userEntry?.trcn_verified || userEntry?.verified ? "Verified" : "Not verified"),
        summary:
          userEntry?.bio ||
          userEntry?.about ||
          `${userEntry?.full_name || "Teacher"} is available for teaching opportunities.`,
        accent: accentColors[index % accentColors.length],
        email: userEntry?.email || "",
        phone: userEntry?.phone || "",
        cv_url: userEntry?.cv_url || "",
        status: userEntry?.status || "active",
        application_id: userEntry?.user_id || userEntry?.id || `teacher-${index}`,
        teacher_id: userEntry?.user_id || userEntry?.id || "",
      }));

    const seenTeachers = new Set();
    const teachers = teacherUsers.length
      ? teacherUsers
      : allApplicants
          .map((app) => {
            const name = app.teacher_name || app.teacher_email || "Teacher";
            const dedupeKey = (app.teacher_email || name).toLowerCase();
            if (seenTeachers.has(dedupeKey)) return null;
            seenTeachers.add(dedupeKey);

            const matchedJob = jobs.find(
              (job) => (job.job_id || job.id) === app.jobId,
            );

            return {
              name,
              role: matchedJob?.title || matchedJob?.role_type || "Teaching Professional",
              location: matchedJob?.location || app.location || "Nigeria",
              experience: app.experience_years
                ? `${app.experience_years} Years`
                : "Not specified",
              subject: app.skills || matchedJob?.role_type || "General",
                  trcnStatus: app.trcn_status || (app.trcn_verified || app.verified ? "Verified" : "Not verified"),
              availability: app.availability || "Available",
              summary:
                app.cover_letter ||
                app.bio ||
                `Applied for ${matchedJob?.title || "a teaching position"} at your school.`,
              accent: accentColors[seenTeachers.size % accentColors.length],
              email: app.teacher_email || "",
              phone: app.teacher_phone || "",
              cv_url: app.cv_url || "",
              status: app.status || "pending",
              application_id: app.application_id || app.id,
              teacher_id: app.teacher_id || "",
            };
          })
          .filter(Boolean);

    const uniqueLocations = [
      "All Locations",
      ...new Set(teachers.map((t) => t.location).filter(Boolean)),
    ];
    const uniqueExperiences = [
      "Experience",
      ...new Set(teachers.map((t) => t.experience).filter((e) => e !== "Not specified")),
    ];
    const uniqueSubjects = [
      "Subject",
      ...new Set(teachers.map((t) => t.subject).filter((s) => s !== "General")),
    ];
    const trcnOptions = ["TRCN", "Verified", "Not verified"];

    const teacherOptions = {
      locations: uniqueLocations,
      experiences: uniqueExperiences,
      subjects: uniqueSubjects,
    };

    const filteredTeachers = teachers.filter((teacher) => {
      const query = teacherSearchSubmitted.trim().toLowerCase();

      const matchesQuery =
        !query ||
        [
          teacher.name,
          teacher.role,
          teacher.subject,
          teacher.location,
          teacher.experience,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesLocation =
        teacherLocation === "All Locations" || teacher.location === teacherLocation;
      const matchesExperience =
        teacherExperience === "Experience" || teacher.experience === teacherExperience;
      const matchesSubject =
        teacherSubject === "Subject" || teacher.subject === teacherSubject;
      const matchesTrcn = teacherTrcn === "TRCN" || teacher.trcnStatus === teacherTrcn;

      return matchesQuery && matchesLocation && matchesExperience && matchesSubject && matchesTrcn;
    });

    return (
      <div className="school-teachers-page">
        {selectedTeacherProfile ? (
          renderTeacherProfileSummaryPage(selectedTeacherProfile)
        ) : (
          <>
            <div className="school-teachers-hero">
              <h1>Find Teachers</h1>
              <p>Discover qualified teachers for your school&apos;s next opportunity.</p>
            </div>

            <form
              className="school-teachers-search-shell"
              onSubmit={(event) => {
                event.preventDefault();
                handleTeacherSearch();
              }}
            >
              <div className="school-teachers-search">
                <span className="school-teachers-search-icon">⌕</span>
                <input
                  type="text"
                  placeholder="Name, Subject, or Qualification..."
                  aria-label="Search teachers"
                  value={teacherSearch}
                  onChange={(event) => setTeacherSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleTeacherSearch();
                    }
                  }}
                />
              </div>

              <div className="school-teachers-dropdown-wrapper">
                <button
                  type="button"
                  className="school-teachers-location-button"
                  onClick={() => {
                    setTeacherLocationMenuOpen((prev) => !prev);
                    setTeacherExperienceMenuOpen(false);
                    setTeacherSubjectMenuOpen(false);
                    setTeacherTrcnMenuOpen(false);
                  }}
                >
                  <span className="school-teachers-location-dot" />
                  {teacherLocation}
                  <span className="school-teachers-caret">▾</span>
                </button>

                {teacherLocationMenuOpen && (
                  <div className="school-teachers-menu" role="menu">
                    {teacherOptions.locations.map((location) => (
                      <button
                        key={location}
                        type="button"
                        className="school-teachers-menu-item"
                        onClick={() => {
                          setTeacherLocation(location);
                          setTeacherLocationMenuOpen(false);
                        }}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="school-teachers-search-btn">
                Search
              </button>
            </form>

            <div className="school-teachers-filter-row">
              <div className="school-teachers-dropdown-wrapper school-teachers-dropdown-wrapper--compact">
                <button
                  type="button"
                  className="school-teachers-filter-tag"
                  onClick={() => {
                    setTeacherExperienceMenuOpen((prev) => !prev);
                    setTeacherSubjectMenuOpen(false);
                    setTeacherLocationMenuOpen(false);
                  }}
                >
                  {teacherExperience} ▾
                </button>

                {teacherExperienceMenuOpen && (
                  <div className="school-teachers-menu school-teachers-menu--compact" role="menu">
                    {teacherOptions.experiences.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className="school-teachers-menu-item"
                        onClick={() => {
                          setTeacherExperience(option);
                          setTeacherExperienceMenuOpen(false);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="school-teachers-dropdown-wrapper school-teachers-dropdown-wrapper--compact">
                <button
                  type="button"
                  className="school-teachers-filter-tag"
                  onClick={() => {
                    setTeacherSubjectMenuOpen((prev) => !prev);
                    setTeacherExperienceMenuOpen(false);
                    setTeacherLocationMenuOpen(false);
                  }}
                >
                  {teacherSubject} ▾
                </button>

                {teacherSubjectMenuOpen && (
                  <div className="school-teachers-menu school-teachers-menu--compact" role="menu">
                    {teacherOptions.subjects.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className="school-teachers-menu-item"
                        onClick={() => {
                          setTeacherSubject(option);
                          setTeacherSubjectMenuOpen(false);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="school-teachers-dropdown-wrapper school-teachers-dropdown-wrapper--compact">
                <button
                  type="button"
                  className="school-teachers-filter-tag"
                  onClick={() => {
                    setTeacherTrcnMenuOpen((prev) => !prev);
                    setTeacherExperienceMenuOpen(false);
                    setTeacherSubjectMenuOpen(false);
                    setTeacherLocationMenuOpen(false);
                  }}
                >
                  {teacherTrcn} ▾
                </button>
                {teacherTrcnMenuOpen && (
                  <div className="school-teachers-menu school-teachers-menu--compact" role="menu">
                    {trcnOptions.map((option) => (
                      <button key={option} type="button" className="school-teachers-menu-item" onClick={() => { setTeacherTrcn(option); setTeacherTrcnMenuOpen(false); }}>
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="school-teachers-header-row">
              <h2>{filteredTeachers.length} Teachers Found</h2>
              <button type="button" className="school-teachers-sort-btn">
                Sort by: Relevance ▾
              </button>
            </div>

            <div className="school-teachers-list">
              {filteredTeachers.slice(0, visibleTeacherCount).map((teacher, index) => (
                <div className="school-teacher-card" key={`${teacher.name}-${index}`}>
                  <div className="school-teacher-card-main">
                    <div className="school-teacher-badge">● {teacher.availability}</div>

                    <div className="school-teacher-profile-row">
                      <div
                        className="school-teacher-avatar"
                        style={{ background: teacher.accent }}
                        aria-hidden="true"
                      >
                        {teacher.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="school-teacher-info">
                        <div className="school-teacher-name-row">
                          <span className="school-teacher-name">{teacher.name}</span>
                          <span className="school-teacher-meta-pill">{teacher.location}</span>
                          <span className="school-teacher-meta-pill">{teacher.experience}</span>
                          <span className="school-teacher-meta-pill">{teacher.subject}</span>
                        </div>
                        <p className="school-teacher-role">{teacher.role}</p>
                        <p className="school-teacher-summary">{teacher.summary}</p>
                      </div>
                    </div>
                  </div>

                  <div className="school-teacher-actions">
                    <button
                      type="button"
                      className="school-teacher-primary-btn"
                      onClick={() => {
                        setSelectedTeacherProfile(teacher);
                        setIsTeacherInviteModalOpen(true);
                      }}
                    >
                      Invite to Apply
                    </button>
                    <button
                      type="button"
                      className="school-teacher-secondary-btn"
                      onClick={() => handleToggleSavedTeacher(teacher)}
                    >
                      {savedTeacherIds.includes(String(teacher.teacher_id || teacher.user_id || teacher.id || teacher.teacherUserId || teacher.application_id)) ? 'Saved' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="school-teacher-secondary-btn"
                      onClick={() => handleViewTeacherProfile(teacher)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredTeachers.length === 0 && (
              <div className="school-teachers-empty-state">
                {allApplicants.length === 0
                  ? "No teachers have applied to your jobs yet. Post a job to start receiving applications."
                  : "No teachers match your current search and filter selection."}
              </div>
            )}

            {filteredTeachers.length > visibleTeacherCount && (
              <div className="school-teachers-load-more-wrap">
                <button type="button" className="school-teachers-load-more" onClick={() => setVisibleTeacherCount((count) => count + 10)}>
                  Load More Candidates ▾
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="admin-dashboard-shell min-h-screen bg-[#f6f8f7] text-[#172238]">
      <div className="flex min-h-screen">
        <aside className="admin-desktop-sidebar hidden w-56 shrink-0 border-r border-[#e3e8e4] bg-white p-5 md:block">
          <div className="admin-sidebar-inner">
            <div className="admin-sidebar-brand">
              <BrandLogo />
            </div>
            <nav className="admin-sidebar-nav">
              {navItems.map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTabChange(key)}
                  className={`admin-sidebar-nav-item ${activeTab === key ? "is-active" : ""}`}
                >
                  <Icon size={19} />
                  <span>
                    {isSchool && key === "applicants" ? "Teachers" : label}
                  </span>
                  {key === "notifications" && notificationItems.some((item) => item.unread) && (
                    <i className="admin-sidebar-notification-dot" />
                  )}
                </button>
              ))}
            </nav>
            {isSchool && (
              <div className="admin-sidebar-help">
                <strong>Need help recruiting?</strong>
                <button type="button" onClick={() => openJobForm("overview")}>
                  <FiPlus size={14} />
                  Post a Job
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              className="admin-sidebar-logout"
            >
              <FiLogOut size={17} />
              Log out
            </button>
          </div>
        </aside>

        <div className="admin-dashboard-main-wrapper flex min-w-0 flex-1 flex-col">
          <header className="admin-desktop-header flex items-center justify-between border-b border-[#e3e8e4] bg-white px-5 py-4 md:px-8">
            <div className="admin-topbar-spacer" />
            <label className="admin-topbar-search">
              <FiSearch size={18} />
              <input
                type="search"
                placeholder="Search vacancies in Lagos..."
                aria-label="Search vacancies"
              />
            </label>
            <div className="admin-topbar-account">
              <button
                type="button"
                onClick={() => handleTabChange("notifications")}
                className="admin-topbar-notifications"
                aria-label="Notifications"
              >
                <FiBell size={18} />
                {notificationItems.some((item) => item.unread) && <span />}
              </button>
              <div className="admin-topbar-divider" />
              <div className="admin-topbar-user">
                <strong>{user?.admin_name || "Admin User"}</strong>
                <span>
                  {user?.school_name || user?.full_name || "School"}
                </span>
              </div>
              <div
                className="admin-topbar-avatar"
                aria-label={schoolDisplayName}
                title={schoolDisplayName}
              >
                {schoolProfileLogo ? (
                  <img src={schoolProfileLogo} alt={schoolDisplayName} />
                ) : (
                  <span>{schoolInitials}</span>
                )}
              </div>
            </div>
          </header>

          <header className="admin-mobile-header">
            <div
              className="admin-mobile-avatar"
              aria-label={schoolDisplayName}
              title={schoolDisplayName}
            >
              {schoolProfileLogo ? (
                <img src={schoolProfileLogo} alt={schoolDisplayName} />
              ) : (
                <span>{schoolInitials}</span>
              )}
            </div>
            <BrandLogo />
            <button
              type="button"
              onClick={() => handleTabChange("notifications")}
              className="admin-mobile-bell"
              aria-label="Notifications"
            >
              <FiBell size={20} />
              {notificationItems.some((item) => item.unread) && <span />}
            </button>
          </header>

          <main className="admin-dashboard-main w-full flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-gray-600 shadow-sm">
                  Loading dashboard data…
                </div>
              ) : (
                <>
                  {isSchool &&
                    activeTab === "overview" &&
                    renderSchoolOverview()}
                  {activeTab === "overview" && !isSchool && (
                    <>
                      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                          <h2 className="text-2xl font-bold">
                            Good morning,{" "}
                            {user?.full_name ||
                              (isSchool ? "School Administrator" : "Admin")}
                          </h2>
                          <p className="mt-1 text-sm text-[#718078]">
                            Manage your school's hiring and recruitment
                            activity.
                          </p>
                        </div>
                        {isSchool && (
                          <button
                            type="button"
                            onClick={() => openJobForm("overview")}
                            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1ccb43] px-5 py-3 text-sm font-bold text-[#12331f]"
                          >
                            <FiPlus /> Post a job
                          </button>
                        )}
                      </div>
                      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                          ["total_users", "Total Users"],
                          ["total_teachers", "Teachers"],
                          ["total_schools", "Schools"],
                          ["total_jobs", "Jobs"],
                          ["active_jobs", "Active Jobs"],
                          ["total_applications", "Applications"],
                          ["pending_verifications", "Pending Verifications"],
                        ].map(([key, label]) => (
                          <div
                            key={key}
                            className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm"
                          >
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              {label}
                            </div>
                            <div className="mt-3 text-3xl font-bold text-gray-900">
                              {stats[key] ?? 0}
                            </div>
                          </div>
                        ))}
                      </div>

                      {isSchool && (
                        <div className="mb-6 grid gap-4 md:grid-cols-3">
                          {[
                            ["active_jobs", "Active Jobs", FiBriefcase],
                            ["total_applications", "Total Applicants", FiUsers],
                            [
                              "pending_verifications",
                              "Pending Reviews",
                              FiClock,
                            ],
                          ].map(([key, label, Icon]) => (
                            <div
                              key={key}
                              className="rounded-2xl border border-[#dfe5e1] bg-white p-5 shadow-sm"
                            >
                              <Icon className="mb-4 text-[#8ca49a]" />
                              <p className="text-xs text-[#718078]">{label}</p>
                              <p className="mt-2 text-3xl font-bold">
                                {stats[key] ?? 0}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {isSchool && activeTab === "overview" && (
                        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
                          <h2 className="mb-4 text-xl font-bold text-gray-800">
                            Your Job Posts
                          </h2>
                          {jobs.length === 0 ? (
                            <p className="text-gray-600">
                              No jobs published yet.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {jobs.map((job) => {
                                const jobId = job.job_id || job.id;
                                const applicants = applicantsByJob[jobId] || [];

                                return (
                                  <div
                                    key={jobId}
                                    className="rounded-xl border border-gray-200 p-4"
                                  >
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                      <div>
                                        <div className="font-semibold text-gray-800">
                                          {job.title || "Teaching role"}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {job.location || "Location pending"} •{" "}
                                          {job.employment_type || "full-time"}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteJob(jobId)}
                                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                      >
                                        Delete
                                      </button>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                      {job.description ||
                                        "No description provided."}
                                    </div>

                                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Applicants
                                      </div>
                                      {applicants.length === 0 ? (
                                        <div className="text-sm text-gray-500">
                                          No applicants yet.
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {applicants
                                            .slice(0, 6)
                                            .map((app, idx) => {
                                              const appId =
                                                app.application_id ||
                                                app.id ||
                                                idx;
                                              const currentStatus = (
                                                app.status || "pending"
                                              ).toLowerCase();

                                              return (
                                                <div
                                                  key={appId}
                                                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                                >
                                                  <div className="flex items-center justify-between gap-3">
                                                    <span className="text-gray-700">
                                                      {app.teacher_name ||
                                                        app.teacher_email ||
                                                        "Applicant"}
                                                    </span>
                                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-emerald-700">
                                                      {currentStatus}
                                                    </span>
                                                  </div>

                                                  <div className="mt-2">
                                                    <select
                                                      value={currentStatus}
                                                      disabled={
                                                        !!statusUpdating[appId]
                                                      }
                                                      onChange={(e) =>
                                                        handleStatusChange(
                                                          jobId,
                                                          appId,
                                                          e.target.value,
                                                        )
                                                      }
                                                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 outline-none"
                                                    >
                                                      <option value="pending">
                                                        Pending
                                                      </option>
                                                      <option value="reviewed">
                                                        Reviewed
                                                      </option>
                                                      <option value="shortlisted">
                                                        Shortlisted
                                                      </option>
                                                      <option value="rejected">
                                                        Rejected
                                                      </option>
                                                      <option value="hired">
                                                        Hired
                                                      </option>
                                                    </select>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {!isSchool && activeTab === "verifications" && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
                          <h2 className="mb-4 text-xl font-bold text-gray-800">
                            Pending Verifications
                          </h2>
                          {verifications.length === 0 ? (
                            <p className="text-gray-600">
                              No pending verification requests right now.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {verifications.map((item) => (
                                <div
                                  key={
                                    item.profile_id ||
                                    item.user_id ||
                                    item.school_name
                                  }
                                  className="rounded-xl border border-gray-200 p-3"
                                >
                                  <div className="font-semibold text-gray-800">
                                    {item.school_name || "School Profile"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.state ||
                                      item.address ||
                                      "Location pending"}
                                  </div>
                                  <span className="mt-2 inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700 uppercase">
                                    {item.verification_status || "pending"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {selectedJob && activeTab === "jobs" && selectedApplicant && renderJobApplicantsPage(selectedJob)}
                  {selectedJob && activeTab === "jobs" && !selectedApplicant && jobDetailView === "detail" ? renderJobDetailPage(selectedJob) : null}
                  {selectedJob && activeTab === "jobs" && !selectedApplicant && jobDetailView === "applicants" ? renderJobApplicantsPage(selectedJob) : null}
                  {!selectedJob &&
                    activeTab === "post-job" &&
                    isSchool &&
                    renderJobForm()}
                  {!selectedJob &&
                    activeTab === "jobs" &&
                    isSchool &&
                    renderJobs()}
                  {!selectedJob &&
                    activeTab === "applicants" &&
                    isSchool &&
                    renderApplicants()}
                  {isSchool &&
                    activeTab === "notifications" &&
                    renderDesktopNotifications()}
                  {activeTab === "notifications" && (
                    <>
                      <div className="admin-mobile-notification-header">
                        <button
                          type="button"
                          onClick={() => handleTabChange("overview")}
                          aria-label="Back to dashboard"
                        >
                          <FiArrowLeft size={22} />
                        </button>
                        <h2>Notifications</h2>
                        <button
                          type="button"
                          className="admin-mobile-notification-mark-read"
                          onClick={markAllNotificationsAsRead}
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="admin-mobile-notifications-content">
                        <div className="admin-mobile-notification-group">
                          <h3>Today</h3>
                          {notificationItems.slice(0, 3).map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.key}
                                type="button"
                                className={`admin-mobile-notification-item ${item.type} ${item.unread ? "is-unread" : ""}`}
                                onClick={() => handleNotificationItemClick(item)}
                              >
                                <span className="school-notification-icon">
                                  <Icon size={16} />
                                </span>
                                <div>
                                  <b>{item.label}</b>
                                  <strong>{item.title}</strong>
                                  {item.description && <p>{item.description}</p>}
                                </div>
                                <time>{item.time}</time>
                              </button>
                            );
                          })}
                        </div>

                        <div className="admin-mobile-notification-group">
                          <h3>Yesterday</h3>
                          {notificationItems.slice(3, 5).map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.key}
                                type="button"
                                className={`admin-mobile-notification-item ${item.type} ${item.unread ? "is-unread" : ""}`}
                                onClick={() => handleNotificationItemClick(item)}
                              >
                                <span className="school-notification-icon">
                                  <Icon size={16} />
                                </span>
                                <div>
                                  <b>{item.label}</b>
                                  <strong>{item.title}</strong>
                                  {item.description && <p>{item.description}</p>}
                                </div>
                                <time>{item.time}</time>
                              </button>
                            );
                          })}
                        </div>

                        <div className="admin-mobile-notification-group">
                          <h3>Earlier</h3>
                          {notificationItems.slice(5).map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.key}
                                type="button"
                                className={`admin-mobile-notification-item ${item.type} ${item.unread ? "is-unread" : ""}`}
                                onClick={() => handleNotificationItemClick(item)}
                              >
                                <span className="school-notification-icon">
                                  <Icon size={16} />
                                </span>
                                <div>
                                  <b>{item.label}</b>
                                  <strong>{item.title}</strong>
                                  {item.description && <p>{item.description}</p>}
                                </div>
                                <time>{item.time}</time>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                  {activeTab === "settings" && (
                    settingsSection === "account-security" ? (
                      <div className="admin-settings-shell admin-settings-subpage">
                        <div className="admin-settings-breadcrumb-row">
                          <button
                            type="button"
                            className="admin-settings-back-link"
                            onClick={() => setSettingsSection("overview")}
                          >
                            Settings
                          </button>
                          <span className="admin-settings-breadcrumb-separator">›</span>
                          <span>Account and settings</span>
                        </div>

                        <div className="admin-settings-panel">
                          <h1 className="admin-settings-subpage-title">Account &amp; Security</h1>
                          <p className="admin-settings-subpage-subtitle">
                            Manage your password, 2FA, and recovery options to keep your administrative access secure.
                          </p>

                          <div className="admin-security-grid">
                            <div className="admin-security-card">
                              <div className="admin-security-card-header">
                                <div className="admin-security-card-icon">
                                  <FiLock size={18} />
                                </div>
                                <h2>Password</h2>
                              </div>

                              <div className="admin-security-password-box">
                                <div className="admin-security-password-row">
                                  <span className="admin-security-label">Current Password</span>
                                  <span className="admin-security-label muted">Last changed: Oct 12, 2023</span>
                                </div>
                                <div className="admin-security-password-mask">••••••••••••••••</div>
                              </div>

                              <button type="button" className="admin-security-action-btn">
                                <FiLock size={14} />
                                Change Password
                              </button>
                            </div>

                            <div className="admin-security-card">
                              <div className="admin-security-card-header">
                                <div className="admin-security-card-icon">
                                  <FiShield size={18} />
                                </div>
                                <h2>Two-Factor Authentication</h2>
                                <button type="button" className="admin-security-toggle" aria-label="Toggle two-factor authentication">
                                  <span className="admin-security-toggle-thumb" />
                                </button>
                              </div>

                              <p className="admin-security-card-copy">
                                Add an extra layer of security to your Staffroom account. Once enabled, you&apos;ll be required to enter a unique code sent to your device alongside your password when signing in.
                              </p>

                              <div className="admin-security-method-row">
                                <div className="admin-security-method-box">
                                  <span className="admin-security-method-box-checkbox" />
                                  <span>Authenticator App</span>
                                </div>
                                <span className="admin-security-method-set">Set Up</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : settingsSection === "school-info" ? (
                      <div className="admin-settings-shell admin-settings-subpage">
                        <div className="admin-settings-breadcrumb-row">
                          <button
                            type="button"
                            className="admin-settings-back-link"
                            onClick={() => setSettingsSection("overview")}
                          >
                            Settings
                          </button>
                          <span className="admin-settings-breadcrumb-separator">›</span>
                          <span>School information</span>
                        </div>

                        <div className="admin-settings-panel admin-school-info-panel">
                          <div className="admin-school-info-header">
                            <div>
                              <h1 className="admin-settings-subpage-title">School Information</h1>
                              <p className="admin-settings-subpage-subtitle admin-school-info-subtitle">
                                Manage the core organizational details and public-facing contact information for your school.
                              </p>
                            </div>
                            <button
                              type="button"
                              className="admin-school-save-btn"
                              onClick={handleSaveSchoolProfile}
                              disabled={savingSchoolProfile}
                            >
                              <FiCheck size={14} />
                              {savingSchoolProfile ? "Saving..." : "Save Changes"}
                            </button>
                          </div>

                          <div className="admin-school-info-layout">
                            <div className="admin-school-main-column">
                              <section className="admin-school-section">
                                <div className="admin-school-section-head">
                                  <div className="admin-school-section-icon">
                                    <FiBookOpen size={16} />
                                  </div>
                                  <span>Institutional Identity</span>
                                </div>

                                <div className="admin-school-identity-box">
                                  <div className="admin-school-logo-upload-block">
                                    <div className="admin-school-logo-box">
                                      {schoolLogoPreview ? (
                                        <img
                                          src={schoolLogoPreview}
                                          alt="Selected school logo preview"
                                          className="admin-school-logo-preview"
                                        />
                                      ) : (
                                        <FiBriefcase size={28} />
                                      )}
                                    </div>
                                    <div className="admin-school-logo-meta">
                                      <div className="admin-school-logo-label">School Logo</div>
                                      <div className="admin-school-logo-help">
                                        Upload a high-resolution logo (PNG or SVG). Recommended size: 512x512px.
                                      </div>
                                      <input
                                        ref={schoolLogoInputRef}
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleSchoolLogoSelect}
                                      />
                                      <button
                                        type="button"
                                        className="admin-school-upload-btn"
                                        onClick={() => schoolLogoInputRef.current?.click()}
                                      >
                                        Update Logo
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="admin-school-form-grid two-col">
                                  <label className="admin-school-field">
                                    <span>School Name</span>
                                    <div className="admin-school-input-wrap">
                                      <input
                                        ref={schoolNameInputRef}
                                        type="text"
                                        value={schoolNameValue}
                                        onChange={(e) => setSchoolNameValue(e.target.value)}
                                        readOnly={!isSchoolNameEditing}
                                      />
                                      <FiEdit
                                        size={18}
                                        onClick={() => {
                                          setIsSchoolNameEditing(!isSchoolNameEditing);
                                          if (!isSchoolNameEditing) {
                                            setTimeout(() => schoolNameInputRef.current?.focus(), 0);
                                          }
                                        }}
                                        style={{ cursor: "pointer" }}
                                      />
                                    </div>
                                  </label>

                                  <label className="admin-school-field">
                                    <span>Institution Type</span>
                                    <div className="admin-school-select-wrap">
                                      <select defaultValue="Private Secondary">
                                        <option>Private Secondary</option>
                                        <option>Public Secondary</option>
                                        <option>Primary School</option>
                                      </select>
                                    </div>
                                    <small>Contact support to change institution type.</small>
                                  </label>
                                </div>
                              </section>

                              <section className="admin-school-section">
                                <div className="admin-school-section-head">
                                  <div className="admin-school-section-icon">
                                    <FiMapPin size={16} />
                                  </div>
                                  <span>Contact &amp; Location</span>
                                </div>

                                <div className="admin-school-form-grid two-col">
                                  <label className="admin-school-field">
                                    <span>Official Email</span>
                                    <div className="admin-school-input-wrap">
                                      <input
                                        ref={emailInputRef}
                                        type="email"
                                        value={emailValue}
                                        onChange={(e) => setEmailValue(e.target.value)}
                                        readOnly={!isEmailEditing}
                                      />
                                      <FiEdit
                                        size={18}
                                        onClick={() => {
                                          setIsEmailEditing(!isEmailEditing);
                                          if (!isEmailEditing) {
                                            setTimeout(() => emailInputRef.current?.focus(), 0);
                                          }
                                        }}
                                        style={{ cursor: "pointer" }}
                                      />
                                    </div>
                                  </label>

                                  <label className="admin-school-field">
                                    <span>Primary Phone</span>
                                    <div className="admin-school-input-wrap">
                                      <input
                                        ref={phoneInputRef}
                                        type="text"
                                        value={phoneValue}
                                        onChange={(e) => setPhoneValue(e.target.value)}
                                        readOnly={!isPhoneEditing}
                                      />
                                      <FiEdit
                                        size={18}
                                        onClick={() => {
                                          setIsPhoneEditing(!isPhoneEditing);
                                          if (!isPhoneEditing) {
                                            setTimeout(() => phoneInputRef.current?.focus(), 0);
                                          }
                                        }}
                                        style={{ cursor: "pointer" }}
                                      />
                                    </div>
                                  </label>
                                </div>

                                <div className="admin-school-form-grid single-col">
                                  <label className="admin-school-field">
                                    <span>Website URL</span>
                                    <div className="admin-school-input-wrap">
                                      <input
                                        ref={websiteInputRef}
                                        type="url"
                                        value={websiteValue}
                                        onChange={(e) => setWebsiteValue(e.target.value)}
                                        readOnly={!isWebsiteEditing}
                                      />
                                      <FiEdit
                                        size={18}
                                        onClick={() => {
                                          setIsWebsiteEditing(!isWebsiteEditing);
                                          if (!isWebsiteEditing) {
                                            setTimeout(() => websiteInputRef.current?.focus(), 0);
                                          }
                                        }}
                                        style={{ cursor: "pointer" }}
                                      />
                                    </div>
                                  </label>
                                </div>

                                <div className="admin-school-form-grid single-col">
                                  <label className="admin-school-field address-field">
                                    <span>Location / Address</span>
                                    <div className="admin-school-address-box">
                                      {!isAddressEditing ? (
                                        <div className="admin-school-address-display">
                                          <div className="admin-school-address-content">
                                            {addressValue.split('\n').map((line, index) => (
                                              <div key={index}>{line}</div>
                                            ))}
                                          </div>
                                          <button
                                            className="admin-school-address-edit-btn"
                                            onClick={() => {
                                              setIsAddressEditing(true);
                                              setTimeout(() => addressTextareaRef.current?.focus(), 0);
                                            }}
                                          >
                                            <FiEdit size={16} />
                                            Edit Address
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <textarea
                                            ref={addressTextareaRef}
                                            className="admin-school-address-textarea"
                                            value={addressValue}
                                            onChange={(e) => setAddressValue(e.target.value)}
                                          />
                                          <div className="admin-school-address-actions">
                                            <button
                                              className="admin-school-address-btn save"
                                              onClick={() => setIsAddressEditing(false)}
                                            >
                                              Save
                                            </button>
                                            <button
                                              className="admin-school-address-btn cancel"
                                              onClick={() => {
                                                setIsAddressEditing(false);
                                                setAddressValue("14 Adeola Okedun Street, Victoria Island\nLagos, Nigeria\nPostal: 101241");
                                              }}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </label>
                                </div>
                              </section>
                            </div>

                            <aside className="admin-school-side-column">
                              <div className="admin-school-side-card admin-school-verified-card">
                                <div className="admin-school-side-card-top">
                                  <div className="admin-school-side-icon-box">
                                    <FiCheckCircle size={18} />
                                  </div>
                                  <span>Verified Institution</span>
                                </div>

                                <div className="admin-school-side-body">
                                  <p>Your school is fully verified with the relevant education authority.</p>
                                  <div className="admin-school-status-row">
                                    <span className="admin-school-status-dot" />
                                    Active Status
                                  </div>
                                </div>
                              </div>

                              <div className="admin-school-side-card admin-school-actions-card">
                                <div className="admin-school-actions-title">
                                  <FiAlertTriangle size={20} />
                                  <span>Administrative Actions</span>
                                </div>
                                <p>Actions here require secondary authentication and may affect all staff.</p>

                                <button type="button" className="admin-school-side-action-btn">
                                  <span>Request Name Change</span>
                                  <FiArrowRight size={16} />
                                </button>

                                <button type="button" className="admin-school-danger-action">Deactivate School Account</button>
                              </div>
                            </aside>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="admin-settings-shell">
                        <div className="admin-settings-header-row">
                          <span className="admin-settings-breadcrumb">Settings</span>
                        </div>

                        <h1 className="admin-settings-title">Settings Overview</h1>
                        <p className="admin-settings-subtitle">
                          Manage your personal administrator profile and oversee institutional configurations
                          for your school from this central hub.
                        </p>

                        <section className="admin-settings-group">
                          <div className="admin-settings-section-head">
                            <div className="admin-settings-section-icon green">
                              <FiUser size={18} />
                            </div>
                            <span>Personal Settings</span>
                          </div>

                          <button type="button" className={`admin-settings-card ${settingsSection === "profile" ? "is-selected" : ""}`} onClick={() => setSettingsSection("profile")}>
                            <div className="admin-settings-card-icon green">
                              <FiUser size={20} />
                            </div>
                            <div className="admin-settings-card-copy">
                              <h3>Profile</h3>
                              <p>Update your administrator details, contact information, and professional credentials.</p>
                            </div>
                            <FiArrowRight className="admin-settings-card-arrow" size={18} />
                          </button>

                          <button type="button" className={`admin-settings-card ${settingsSection === "account-security" ? "is-selected" : ""}`} onClick={() => setSettingsSection("account-security")}>
                            <div className="admin-settings-card-icon green">
                              <FiShield size={20} />
                            </div>
                            <div className="admin-settings-card-copy">
                              <h3>Account &amp; Security</h3>
                              <p>Manage your password, two-factor authentication, and active sessions.</p>
                            </div>
                            <FiArrowRight className="admin-settings-card-arrow" size={18} />
                          </button>
                        </section>

                        <section className="admin-settings-group">
                          <div className="admin-settings-section-head">
                            <div className="admin-settings-section-icon gray">
                              <FiHome size={18} />
                            </div>
                            <span>Institutional Settings</span>
                          </div>

                          <button type="button" className={`admin-settings-card ${settingsSection === "school-info" ? "is-selected" : ""}`} onClick={() => setSettingsSection("school-info")}>
                            <div className="admin-settings-card-icon gray">
                              <FiBriefcase size={20} />
                            </div>
                            <div className="admin-settings-card-copy">
                              <h3>School Information</h3>
                              <p>Configure institutional details, academic calendars, grading systems, and global contact information for external communications.</p>
                            </div>
                            <FiArrowRight className="admin-settings-card-arrow" size={18} />
                          </button>

                          <button type="button" className={`admin-settings-card ${settingsSection === "notifications-privacy" ? "is-selected" : ""}`} onClick={() => setSettingsSection("notifications-privacy")}>
                            <div className="admin-settings-card-icon gray">
                              <FiBell size={20} />
                            </div>
                            <div className="admin-settings-card-copy">
                              <h3>Notifications &amp; Privacy</h3>
                              <p>Configure system alerts, email digests, and data privacy policies for the institution.</p>
                            </div>
                            <FiArrowRight className="admin-settings-card-arrow" size={18} />
                          </button>
                        </section>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
      <nav
        className="admin-mobile-bottomnav"
        aria-label="Mobile dashboard navigation"
      >
        {navItems.map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTabChange(key)}
            className={activeTab === key ? "is-active" : ""}
          >
            <Icon size={19} />
            <span>{isSchool && key === "applicants" ? "Teachers" : label}</span>
          </button>
        ))}
      </nav>
      {isTeacherInviteModalOpen && renderTeacherInviteModal()}
      {isShortlistModalOpen && renderShortlistModal()}
      {isShortlistSuccessOpen && renderShortlistSuccessModal()}
      {isSchool && isNotificationModalOpen && selectedNotification && (
        <div
          className="admin-notification-modal-backdrop"
          onClick={() => setIsNotificationModalOpen(false)}
        >
          <div
            className="admin-notification-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="school-notification-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-notification-modal-header">
              <h2 id="school-notification-title">Notification</h2>
              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(false)}
                aria-label="Close notification"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="admin-notification-modal-content">
              <span className="admin-notification-modal-label">{selectedNotification.label}</span>
              <h3>{selectedNotification.title}</h3>
              <p>{selectedNotification.description || "No additional details are available."}</p>
              <time>{selectedNotification.time}</time>
            </div>
            <div className="admin-notification-modal-actions">
              <button
                type="button"
                className="admin-notification-read-btn"
                onClick={() => markSchoolNotificationAsRead(selectedNotification.key)}
                disabled={!selectedNotification.unread || notificationActionLoading[selectedNotification.key] === "read"}
              >
                {notificationActionLoading[selectedNotification.key] === "read"
                  ? "Marking as read..."
                  : selectedNotification.unread ? "Mark as read" : "Read"}
              </button>
              <button
                type="button"
                className="admin-notification-delete-btn"
                onClick={() => deleteSchoolNotification(selectedNotification.key)}
                disabled={notificationActionLoading[selectedNotification.key] === "delete"}
              >
                {notificationActionLoading[selectedNotification.key] === "delete" ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {snackbar && (
        <div
          className={`admin-snackbar ${isSnackbarClosing ? "is-closing" : ""}`}
          role="status"
        >
          <span className="admin-snackbar-icon">
            <FiCheck size={24} />
          </span>
          <div>
            <strong>{snackbar.title}</strong>
            <p>{snackbar.message}</p>
          </div>
          <button
            type="button"
            onClick={dismissSnackbar}
            aria-label="Dismiss notification"
          >
            <FiX size={25} />
          </button>
        </div>
      )}
      <style>{`
    .admin-notification-modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: rgba(15, 23, 42, .5); }
    .admin-notification-modal { width: min(480px, 100%); border-radius: 22px; padding: 24px; background: #fff; box-shadow: 0 20px 60px rgba(15, 23, 42, .2); }
    .admin-notification-modal-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
    .admin-notification-modal-header h2 { margin: 0; color: #0f172a; font-size: 22px; }
    .admin-notification-modal-header button { display: grid; place-items: center; border: 0; background: transparent; color: #475569; cursor: pointer; }
    .admin-notification-modal-content { margin-bottom: 20px; }
    .admin-notification-modal-label { color: #15803d; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .admin-notification-modal-content h3 { margin: 8px 0; color: #111827; font-size: 17px; }
    .admin-notification-modal-content p { margin: 0 0 12px; color: #475569; line-height: 1.7; }
    .admin-notification-modal-content time { color: #64748b; font-size: 12px; }
    .admin-notification-modal-actions { display: flex; gap: 12px; }
    .admin-notification-modal-actions button { flex: 1; min-height: 42px; border-radius: 12px; font-weight: 600; cursor: pointer; }
    .admin-notification-read-btn { border: 0; background: #15803d; color: #fff; }
    .admin-notification-delete-btn { border: 1px solid #e2e8f0; background: #fff; color: #0f172a; }
    .admin-notification-modal-actions button:disabled { cursor: not-allowed; opacity: .65; }
.admin-settings-shell {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 0 24px;
          color: #1d2d2d;
        }
        .admin-settings-header-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 4px;
          color: #6d7672;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: -0.02em;
        }
        .admin-settings-breadcrumb {
          color: #6d7672;
        }
        .admin-settings-title {
          margin: 12px 0 8px;
          color: #1f2e2d;
          font-family: 'Sora', sans-serif;
          font-size: 48px;
          font-weight: 700;
          letter-spacing: -0.096px;
          line-height: 56px;
        }
        .admin-settings-subtitle {
          max-width: 840px;
          margin: 0 0 16px;
          color: #5e6967;
          font-size: 18px;
          font-weight: 400;
          line-height: 1.45;
        }
        .admin-settings-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid #dfe3df;
        }
        .admin-settings-group:first-of-type {
          margin-top: 0;
          padding-top: 0;
          border-top: 0;
        }
        .admin-settings-section-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2px;
          color: #1f2d2d;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .admin-settings-section-icon {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 7px;
          background: rgba(39, 176, 110, 0.08);
          color: #1a9f63;
        }
        .admin-settings-section-icon.gray {
          background: rgba(72, 86, 90, 0.08);
          color: #495b5a;
        }
        .admin-settings-card {
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) 18px;
          align-items: center;
          gap: 16px;
          width: 100%;
          min-height: 120px;
          padding: 14px 16px 14px 14px;
          border: 1px solid #dfe3df;
          border-radius: 12px;
          background: #f3f5f4;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .admin-settings-card:hover {
          border-color: #ccd6d2;
          box-shadow: 0 8px 18px rgba(19, 30, 28, 0.04);
          transform: translateY(-1px);
        }
        .admin-settings-card.is-selected {
          border-color: #9cd1b7;
          background: #edf8f2;
          box-shadow: inset 0 0 0 1px rgba(28, 154, 99, 0.08), 0 8px 18px rgba(19, 30, 28, 0.04);
        }
        .admin-settings-card-icon {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(33, 164, 99, 0.12);
          color: #1b9c63;
        }
        .admin-settings-card-icon.gray {
          background: rgba(72, 86, 90, 0.08);
          color: #46575a;
        }
        .admin-settings-card-copy {
          min-width: 0;
        }
        .admin-settings-card-copy h3 {
          margin: 0 0 6px;
          color: #1f2d2d;
          font-size: 25px;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.04em;
        }
        .admin-settings-card-copy p {
          margin: 0;
          color: #697875;
          font-size: 16px;
          line-height: 1.45;
          max-width: 640px;
        }
        .admin-settings-card-arrow {
          justify-self: end;
          color: #5a6966;
          width: 18px;
          height: 18px;
        }
        @media (max-width: 768px) {
          .admin-settings-shell {
            max-width: 100%;
          }
          .admin-settings-title {
            margin: 10px 0 8px;
            font-size: 36px;
            line-height: 44px;
          }
          .admin-settings-subtitle {
            margin-bottom: 12px;
            font-size: 15px;
            line-height: 1.5;
          }
          .admin-settings-group {
            gap: 10px;
            margin-top: 16px;
            padding-top: 12px;
          }
          .admin-settings-section-head {
            font-size: 15px;
          }
          .admin-settings-card {
            grid-template-columns: 28px minmax(0, 1fr) 16px;
            gap: 12px;
            min-height: 110px;
            padding: 12px 12px 12px 10px;
          }
          .admin-settings-card-copy h3 {
            font-size: 22px;
          }
          .admin-settings-card-copy p {
            font-size: 14px;
          }
          .admin-settings-subpage {
            padding-top: 4px;
          }
          .admin-settings-panel {
            padding-top: 18px;
          }
          .admin-settings-subpage-title {
            font-size: 30px;
          }
          .admin-settings-subpage-subtitle {
            font-size: 15px;
          }
          .admin-security-grid {
            display: flex;
            flex-direction: column;
            grid-template-columns: none;
            gap: 18px;
          }
          .admin-security-card {
            min-height: auto;
            padding: 14px;
            gap: 14px;
          }
          .admin-security-card-header {
            align-items: flex-start;
            gap: 10px;
          }
          .admin-security-card-header h2 {
            font-size: 15px;
            line-height: 1.35;
          }
          .admin-security-password-box {
            padding: 10px 12px 12px;
          }
          .admin-security-password-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          .admin-security-label {
            font-size: 12px;
          }
          .admin-security-label.muted {
            font-size: 11px;
          }
          .admin-security-password-mask {
            font-size: 20px;
            letter-spacing: 0.14em;
          }
          .admin-security-action-btn {
            min-height: 42px;
          }
          .admin-security-card-copy {
            font-size: 13px;
          }
          .admin-security-method-row {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .admin-security-method-box {
            width: 100%;
          }
          .admin-security-method-set {
            align-self: flex-end;
          }
        }
        @media (max-width: 480px) {
          .admin-settings-header-row,
          .admin-settings-breadcrumb-row {
            font-size: 10px;
          }
          .admin-settings-title {
            font-size: 30px;
            line-height: 38px;
          }
          .admin-settings-subtitle {
            font-size: 14px;
          }
          .admin-settings-section-head {
            font-size: 14px;
          }
          .admin-settings-card-copy h3 {
            font-size: 20px;
          }
          .admin-settings-card-copy p {
            font-size: 13px;
          }
          .admin-settings-card-icon {
            width: 28px;
            height: 28px;
          }
          .admin-security-card-header h2 {
            font-size: 15px;
          }
          .admin-security-method-row {
            flex-direction: column;
            align-items: stretch;
          }
          .admin-security-method-box {
            width: 100%;
          }
        }
        .admin-settings-subpage {
          padding-top: 8px;
        }
        .admin-settings-breadcrumb-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 4px;
          color: #6d7672;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: -0.02em;
        }
        .admin-settings-back-link {
          border: 0;
          background: transparent;
          padding: 0;
          color: #6d7672;
          font: inherit;
          cursor: pointer;
        }
        .admin-settings-breadcrumb-separator {
          color: #7d8a87;
        }
        .admin-settings-panel {
          margin-top: 8px;
          padding: 26px 0 0;
          border-top: 1px solid #dfe3df;
        }
        .admin-settings-subpage-title {
          margin: 0 0 6px;
          color: #1f2e2d;
          font-family: 'Sora', sans-serif;
          font-size: 42px;
          font-weight: 700;
          letter-spacing: -0.085px;
          line-height: 1.15;
        }
        .admin-settings-subpage-subtitle {
          margin: 0 0 18px;
          color: #5d6d69;
          font-size: 17px;
          line-height: 1.5;
        }
        .admin-security-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px;
          margin-top: 10px;
        }
        .admin-security-card {
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-height: 220px;
          padding: 18px 18px 16px;
          border: 1px solid #dfe3df;
          border-radius: 12px;
          background: #f4f5f4;
        }
        .admin-security-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 24px;
          color: #1d2d2d;
        }
        .admin-security-card-icon {
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 7px;
          background: rgba(29, 161, 102, 0.08);
          color: #1b9c63;
        }
        .admin-security-card-header h2 {
          margin: 0;
          flex: 1;
          color: #1f2d2d;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .admin-security-password-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px 14px 14px;
          border: 1px solid #dfe3df;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.28);
        }
        .admin-security-password-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 13px;
        }
        .admin-security-label {
          color: #2c3c3b;
          font-weight: 600;
        }
        .admin-security-label.muted {
          color: #778680;
          font-weight: 500;
        }
        .admin-security-password-mask {
          color: #252d2e;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 0.12em;
          line-height: 1;
        }
        .admin-security-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 38px;
          border: 1px solid #dfe3df;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.18);
          color: #1b242a;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .admin-security-toggle {
          position: relative;
          display: inline-flex;
          align-items: center;
          width: 40px;
          height: 22px;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: #d1d6d3;
          cursor: pointer;
          outline: none;
        }
        .admin-security-toggle-thumb {
          position: absolute;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(17, 24, 24, 0.22);
          transition: transform 0.2s ease;
        }
        .admin-security-card-copy {
          margin: 0;
          color: #5d6d69;
          font-size: 14px;
          line-height: 1.55;
        }
        .admin-security-method-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          margin-top: auto;
          padding-top: 6px;
        }
        .admin-security-method-box {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-height: 34px;
          padding: 0 12px;
          border: 1px solid #dfe3df;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.18);
          color: #2a3938;
          font-size: 14px;
        }
        .admin-security-method-box-checkbox {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 1px solid #d0d6d3;
          border-radius: 4px;
          background: #f9faf9;
        }
        .admin-security-method-set {
          color: #4e5b59;
          font-size: 14px;
          font-weight: 600;
        }
        .admin-school-info-panel {
          padding-top: 18px;
        }
        .admin-school-info-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
        .admin-school-info-subtitle {
          max-width: 760px;
          margin-bottom: 0;
        }
        .admin-school-save-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 140px;
          min-height: 42px;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(180deg, #1f9c67 0%, #1c8d61 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(32, 148, 93, 0.15);
        }
        .admin-school-info-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.75fr) minmax(260px, 0.78fr);
          gap: 28px;
          align-items: flex-start;
        }
        .admin-school-main-column,
        .admin-school-side-column {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .admin-school-section {
          border: 1px solid #dfe4df;
          border-radius: 16px;
          background: #f3f4f3;
          overflow: hidden;
        }
        .admin-school-section-head {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 52px;
          padding: 0 18px;
          background: #14792D;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .admin-school-section-icon {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.22);
        }
        .admin-school-identity-box {
          padding: 18px 18px 0;
        }
        .admin-school-logo-upload-block {
          display: flex;
          align-items: center;
          gap: 18px;
          width: 100%;
          min-height: 112px;
          padding: 14px 16px;
          border: 1px solid #dde4df;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.28);
        }
        .admin-school-logo-box {
          display: grid;
          place-items: center;
          width: 72px;
          height: 72px;
          border: 1px solid #d8dddd;
          border-radius: 10px;
          background: linear-gradient(180deg, #f6f8f7 0%, #eef2f1 100%);
          color: #1d9a66;
          flex-shrink: 0;
          overflow: hidden;
        }
        .admin-school-logo-preview {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #fff;
          padding: 6px;
          box-sizing: border-box;
        }
        .admin-school-logo-meta {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }
        .admin-school-logo-label {
          color: #203431;
          font-size: 15px;
          font-weight: 700;
        }
        .admin-school-logo-help {
          color: #5c6d68;
          font-size: 12px;
          line-height: 1.5;
        }
        .admin-school-upload-btn {
          align-self: flex-start;
          margin-top: 2px;
          min-height: 34px;
          padding: 0 14px;
          border: 1px solid #1d9a66;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.34);
          color: #245a4b;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .admin-school-form-grid {
          display: grid;
          gap: 18px;
          padding: 18px;
        }
        .admin-school-form-grid.two-col {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .admin-school-form-grid.single-col {
          grid-template-columns: 1fr;
        }
        .admin-school-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #213533;
          font-size: 13px;
          font-weight: 600;
        }
        .admin-school-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .admin-school-input-wrap input {
          flex: 1;
        }
        .admin-school-input-wrap svg {
          position: absolute;
          right: 14px;
          color: #7a8784;
          cursor: pointer;
          transition: color 0.2s ease;
          pointer-events: auto;
        }
        .admin-school-input-wrap svg:hover {
          color: #1d9a66;
        }
        .admin-school-field input,
        .admin-school-field select {
          width: 100%;
          min-height: 46px;
          border: 1px solid #c5ccc9;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.8);
          color: #22312e;
          font-size: 15px;
          padding: 0 14px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .admin-school-field input:not([readonly]):focus {
          border-color: #1d9a66;
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 0 0 3px rgba(29, 154, 102, 0.1);
        }
        .admin-school-input-wrap input {
          padding-right: 40px;
        }
        .admin-school-select-wrap {
          position: relative;
        }
        .admin-school-select-wrap select {
          appearance: none;
          padding-right: 36px;
        }
        .admin-school-select-wrap::after {
          content: "▾";
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #4c5b59;
          pointer-events: none;
          font-size: 16px;
        }
        .admin-school-field small {
          color: #6a7775;
          font-size: 11px;
          font-weight: 500;
        }
        .admin-school-address-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: auto;
          padding: 18px;
          border: 1px solid #c5ccc9;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.8);
          color: #2a3c3b;
          font-size: 15px;
          line-height: 1.6;
        }
        .admin-school-address-display {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .admin-school-address-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #22312e;
          font-size: 15px;
          font-weight: 500;
        }
        .admin-school-address-edit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #1d9a66;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          white-space: nowrap;
          transition: color 0.2s ease;
        }
        .admin-school-address-edit-btn:hover {
          color: #0f6642;
        }
        .admin-school-address-textarea {
          flex: 1;
          min-height: 120px;
          padding: 12px 14px;
          border: 1px solid #c5ccc9;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
          color: #22312e;
          font-size: 14px;
          font-family: "DM Sans", sans-serif;
          line-height: 1.6;
          resize: vertical;
          outline: none;
          transition: all 0.2s ease;
        }
        .admin-school-address-textarea:focus {
          border-color: #1d9a66;
          box-shadow: 0 0 0 3px rgba(29, 154, 102, 0.1);
        }
        .admin-school-address-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .admin-school-address-btn {
          padding: 8px 16px;
          border: 1px solid #c5ccc9;
          border-radius: 8px;
          background: white;
          color: #22312e;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .admin-school-address-btn.save {
          border-color: #1d9a66;
          background: #1d9a66;
          color: white;
        }
        .admin-school-address-btn.save:hover {
          background: #0f6642;
          border-color: #0f6642;
        }
        .admin-school-address-btn.cancel {
          border-color: #ddd;
          background: #f5f5f5;
        }
        .admin-school-address-btn.cancel:hover {
          background: #eeeeee;
        }
        .admin-school-side-card {
          padding: 28px 18px 24px;
          border: 1px solid #dfe4df;
          border-radius: 12px;
          background: #f3f4f3;
          color: #213533;
        }
        .admin-school-verified-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }
        .admin-school-side-card-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
          margin-bottom: 0;
          color: #1e2d2d;
          font-size: 18px;
          font-weight: 700;
        }
        .admin-school-side-icon-box {
          display: grid;
          place-items: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(23, 146, 88, 0.2);
          color: #1c9a63;
          flex-shrink: 0;
        }
        .admin-school-side-icon-box svg {
          width: 28px;
          height: 28px;
        }
        .admin-school-side-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        .admin-school-side-body p {
          margin: 0;
          color: #536461;
          font-size: 13px;
          line-height: 1.6;
        }
        .admin-school-status-row {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 0;
          color: #1d7d58;
          font-size: 13px;
          font-weight: 600;
        }
        .admin-school-status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1d9a66;
        }
        .admin-school-side-card-title {
          margin: 0 0 8px;
          color: #1b2928;
          font-size: 17px;
          font-weight: 700;
        }
        .admin-school-actions-card {
          background: #fff8f8 !important;
          border-color: #f0d4d4 !important;
        }
        .admin-school-actions-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 12px;
          color: #d45d5d;
          font-size: 17px;
          font-weight: 700;
        }
        .admin-school-actions-title svg {
          color: #d45d5d;
          flex-shrink: 0;
        }
        .admin-school-actions-card p {
          margin: 0 0 16px;
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }
        .admin-school-side-action-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          min-height: 44px;
          padding: 0 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
          color: #22312e;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .admin-school-side-action-btn:hover {
          border-color: #bbb;
          background: #fafafa;
        }
        .admin-school-danger-action {
          display: block;
          width: 100%;
          margin-top: 16px;
          padding: 12px 0 0;
          border: none;
          border-top: 1px solid #f0d4d4;
          background: none;
          color: #d45d5d;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
          text-align: left;
        }
        .admin-school-danger-action:hover {
          color: #c0494d;
        }
        @media (max-width: 768px) {
          .admin-school-info-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .admin-school-save-btn {
            width: 100%;
          }
          .admin-school-info-layout {
            grid-template-columns: 1fr;
          }
          .admin-school-form-grid.two-col {
            grid-template-columns: 1fr;
          }
          .admin-school-logo-upload-block {
            align-items: flex-start;
            flex-direction: column;
          }
          .admin-school-logo-box {
            width: 64px;
            height: 64px;
          }
          .admin-school-upload-btn {
            width: 100%;
          }
          .admin-school-side-card {
            padding: 14px;
          }
          .admin-school-side-card-top {
            font-size: 15px;
          }
        }
        @media (max-width: 768px) {
          .admin-security-grid {
            display: flex;
            flex-direction: column;
            grid-template-columns: none;
            gap: 18px;
          }
          .admin-security-card {
            width: 100%;
            min-height: auto;
            padding: 14px;
            gap: 14px;
          }
          .admin-security-card-header {
            align-items: flex-start;
            gap: 10px;
          }
          .admin-security-card-header h2 {
            font-size: 15px;
            line-height: 1.35;
          }
          .admin-security-password-box {
            padding: 10px 12px 12px;
          }
          .admin-security-password-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          .admin-security-label {
            font-size: 12px;
          }
          .admin-security-label.muted {
            font-size: 11px;
          }
          .admin-security-password-mask {
            font-size: 20px;
            letter-spacing: 0.14em;
          }
          .admin-security-action-btn {
            min-height: 42px;
          }
          .admin-security-card-copy {
            font-size: 13px;
          }
          .admin-security-method-row {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .admin-security-method-box {
            width: 100%;
          }
          .admin-security-method-set {
            align-self: flex-end;
          }
        }
        .admin-snackbar { position: fixed; z-index: 60; top: 18px; left: 50%; display: flex; align-items: flex-start; gap: 12px; width: min(440px, calc(100vw - 28px)); padding: 16px 18px; border: 1px solid #d2d5d8; border-radius: 18px; background: #f8f8f9; box-shadow: 0 10px 22px rgba(23, 34, 56, .14); transform: translateX(-50%) translateY(0); opacity: 1; transition: transform 280ms ease-in-out, opacity 280ms ease-in-out, visibility 280ms ease-in-out; visibility: visible; }
        .admin-snackbar.is-closing { transform: translateX(-50%) translateY(-12px); opacity: 0; visibility: hidden; }
        .admin-snackbar-icon { display: grid; place-items: center; flex: 0 0 auto; width: 42px; height: 42px; border-radius: 50%; background: #138536; color: #fff; }
        .admin-snackbar-icon svg { stroke-width: 3; width: 18px; height: 18px; }
        .admin-snackbar > div { flex: 1; padding-top: 2px; }
        .admin-snackbar strong { display: block; color: #090b0d; font-size: 16px; font-weight: 700; line-height: 1.3; }
        .admin-snackbar p { margin: 8px 0 0; color: #090b0d; font-size: 14px; line-height: 1.35; }
        .admin-snackbar > button { display: grid; place-items: center; padding: 0; border: 0; background: transparent; color: #090b0d; cursor: pointer; }

        .school-teacher-invite-backdrop {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 16px;
          background: rgba(20, 24, 24, 0.18);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          z-index: 110;
        }
        .school-teacher-invite-modal {
          width: min(100%, 470px);
          padding: 14px 16px 12px;
          border: 1px solid rgba(33, 38, 38, 0.08);
          border-radius: 16px;
          background: rgba(246, 247, 246, 0.96);
          box-shadow: 0 12px 26px rgba(18, 24, 19, 0.12);
          text-align: left;
        }
        .school-teacher-invite-title {
          margin: 0 0 4px;
          color: #1a2024;
          font-size: clamp(1.6rem, 1.8vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.05em;
          text-align: center;
        }
        .school-teacher-invite-subtitle {
          margin: 0 0 10px;
          color: #49555d;
          font-size: 0.82rem;
          font-weight: 400;
          text-align: center;
          line-height: 1.45;
        }
        .school-teacher-invite-subtitle strong {
          color: #111b22;
          font-weight: 700;
        }
        .school-teacher-invite-profile-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid #e4e8e6;
          border-radius: 10px;
          background: rgba(233, 236, 235, 0.75);
          margin-bottom: 12px;
        }
        .school-teacher-invite-avatar {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2b3e39, #7c968d);
          color: #fff;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .school-teacher-invite-name {
          color: #121b1d;
          font-size: 0.88rem;
          font-weight: 700;
        }
        .school-teacher-invite-role {
          margin: 2px 0 5px;
          color: #5a666b;
          font-size: 0.76rem;
          font-weight: 500;
        }
        .school-teacher-invite-meta-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }
        .school-teacher-invite-pill {
          display: inline-flex;
          align-items: center;
          min-height: 20px;
          padding: 3px 7px;
          border-radius: 999px;
          background: rgba(18, 170, 98, 0.12);
          color: #0d7c54;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .school-teacher-invite-meta {
          color: #58666a;
          font-size: 0.68rem;
          font-weight: 600;
        }
        .school-teacher-invite-school-block,
        .school-teacher-invite-details-block {
          margin-bottom: 10px;
        }
        .school-teacher-invite-label {
          margin: 0 0 6px;
          color: #1f2a2d;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .school-teacher-invite-school-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 10px;
          border: 1px solid #e3e7e6;
          border-radius: 10px;
          background: #eef1f0;
          color: #1b2327;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .school-teacher-invite-school-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          color: #0e7d55;
          flex-shrink: 0;
        }
        .school-teacher-invite-school-badge svg {
          display: block;
          width: 100%;
          height: 100%;
        }
        .school-teacher-invite-textarea {
          width: 100%;
          min-height: 80px;
          padding: 10px 12px;
          border: 1px solid #e3e7e6;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.18);
          color: #1f2d31;
          font: inherit;
          font-size: 0.8rem;
          line-height: 1.45;
          resize: vertical;
          outline: none;
        }
        .school-teacher-invite-send-btn {
          width: 100%;
          min-height: 42px;
          margin-top: 6px;
          border: 1px solid #2ae156;
          border-radius: 9px;
          background: #2ae156;
          color: #000000;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
        }
        .school-teacher-invite-cancel-btn {
          width: 100%;
          min-height: 40px;
          margin-top: 8px;
          border: 1px solid #dfe6e2;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.72);
          color: #1d2b2f;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
        }

        .school-shortlist-modal-backdrop {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 24px;
          overflow-y: auto;
          background: rgba(17, 24, 24, 0.32);
          z-index: 100;
        }
        .school-shortlist-modal {
          width: min(100%, 460px);
          max-height: calc(100vh - 48px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e1e6e5;
          border-radius: 18px;
          background: #f4f6f5;
          box-shadow: 0 24px 48px rgba(17, 24, 24, 0.15);
        }
        .school-shortlist-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-shrink: 0;
          padding: 18px 18px 10px;
          color: #121c2a;
        }
        .school-shortlist-modal-heading {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .school-shortlist-modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.04em;
        }
        .school-shortlist-modal-subtitle {
          margin: 0;
          color: #56656d;
          font-size: 12px;
          font-weight: 500;
        }
        .school-shortlist-modal-close {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #62706d;
          cursor: pointer;
        }
        .school-shortlist-modal-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          padding: 0 18px 18px;
        }
        .school-shortlist-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #232f3a;
          font-size: 13px;
          font-weight: 600;
          width: 100%;
        }
        .school-shortlist-field > select {
          width: 50%;
          min-width: 220px;
        }
        .school-shortlist-status-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px 16px;
          align-items: end;
        }
        .school-shortlist-status-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .school-shortlist-status-label {
          color: #232f3a;
          font-size: 13px;
          font-weight: 600;
        }
        .school-shortlist-status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 46px;
          padding: 0 14px;
          border: 1px solid #dbe3df;
          border-radius: 12px;
          background: rgba(28, 141, 96, 0.08);
          color: #11734d;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }
        .school-shortlist-status-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #1a9c62;
          box-shadow: 0 0 0 4px rgba(26, 156, 98, 0.18);
        }
        .school-shortlist-status-select {
          width: 100%;
          min-height: 46px;
          padding: 0 14px;
          border: 1px solid #d8e0de;
          border-radius: 12px;
          background: #f9faf9;
          color: #1f2d2d;
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #53605b 50%), linear-gradient(135deg, #53605b 50%, transparent 50%);
          background-position: calc(100% - 18px) calc(50% - 2px), calc(100% - 12px) calc(50% - 2px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
        }
        .school-shortlist-detail-block--link-row {
          grid-column: 1 / -1;
        }
        .school-shortlist-field--template {
          gap: 10px;
        }
        .school-shortlist-interview-details {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 6px;
          padding: 14px 16px 12px;
          border: 1px solid #e4e8e7;
          border-radius: 16px;
          background: rgba(232, 236, 239, 0.42);
        }
        .school-shortlist-interview-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0f7b55;
          font-size: 15px;
          font-weight: 700;
        }
        .school-shortlist-calendar-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          font-size: 18px;
          line-height: 1;
        }
        .school-shortlist-interview-header h4 {
          margin: 0;
          color: #0f7b55;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .school-shortlist-details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px 16px;
          align-items: start;
        }
        .school-shortlist-detail-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .school-shortlist-detail-block label {
          display: block;
          margin: 0;
          color: #1d2931;
          font-size: 12px;
          font-weight: 600;
        }
        .school-shortlist-detail-block input {
          width: 100%;
          min-height: 46px;
          padding: 10px 12px;
          border: 1px solid #dfe5e3;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.28);
          color: #1c2226;
          font: inherit;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.02em;
          outline: none;
          box-sizing: border-box;
        }
        .school-shortlist-detail-block input:focus {
          border-color: #1c8d60;
          box-shadow: 0 0 0 3px rgba(28, 141, 96, 0.08);
        }
        .school-shortlist-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 46px;
          padding: 0 12px 0 10px;
          border: 1px solid #dfe5e3;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.28);
          box-sizing: border-box;
        }
        .school-shortlist-input-wrap input {
          min-height: 0;
          height: 100%;
          padding: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          font-size: 14px;
          line-height: 1.4;
        }
        .school-shortlist-location-dot {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          color: #8a9190;
          font-size: 15px;
          flex-shrink: 0;
        }
        .school-shortlist-link-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          color: #7e8a88;
          font-size: 18px;
          flex-shrink: 0;
        }
        .school-shortlist-recipient-input {
          min-height: 40px !important;
          padding: 10px 12px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
        }
        .school-shortlist-detail-block--wide {
          grid-column: 1 / 2;
        }
        .school-shortlist-detail-block--right {
          grid-column: 2 / 3;
        }
        .school-shortlist-template-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #1e2a2b;
          font-size: 15px;
          font-weight: 700;
        }
        .school-shortlist-template-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #0d7d54;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .school-shortlist-gear {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          line-height: 1;
        }
        .school-shortlist-template-select {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          min-height: 62px;
          padding: 0 18px 0 20px;
          border: 1px solid #e2e8e6;
          border-radius: 999px;
          background: #f8f9f8;
          color: #9aa3a1;
          font-size: 18px;
          font-weight: 500;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.55);
          cursor: pointer;
        }
        .school-shortlist-template-value {
          overflow: hidden;
          color: #8b908d;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .school-shortlist-dropdown-caret {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          color: #7a817e;
          line-height: 1;
          flex-shrink: 0;
        }
        .school-shortlist-dropdown-caret svg {
          width: 18px;
          height: 18px;
          display: block;
        }
        .school-shortlist-template-menu {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
          padding: 10px 8px;
          border: 1px solid #e3e9e7;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 18px 35px rgba(16, 24, 20, 0.08);
        }
        .school-shortlist-template-option {
          width: 100%;
          padding: 12px 14px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #27353c;
          text-align: left;
          font: inherit;
          font-size: 14px;
          cursor: pointer;
        }
        .school-shortlist-template-option:hover {
          background: #f3f7f4;
        }
        .school-shortlist-field select,
        .school-shortlist-field textarea {
          width: 100%;
          border: 1px solid #d8e0de;
          border-radius: 12px;
          background: #f9faf9;
          color: #1f2d2d;
          font: inherit;
        }
        .school-shortlist-field select {
          height: 46px;
          padding: 0 14px;
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #53605b 50%), linear-gradient(135deg, #53605b 50%, transparent 50%);
          background-position: calc(100% - 18px) calc(50% - 2px), calc(100% - 12px) calc(50% - 2px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
        }
        .school-shortlist-field > select {
          width: 50%;
          max-width: 50%;
          min-width: 220px;
        }
        .school-shortlist-field textarea {
          min-height: 120px;
          padding: 12px 14px;
          resize: vertical;
          line-height: 1.5;
        }
        .school-shortlist-select-wrap {
          position: relative;
        }
        .school-shortlist-select-wrap select {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border: 1px solid #d8e0de;
          border-radius: 12px;
          background: #f9faf9;
          appearance: none;
          color: #1f2d2d;
          font: inherit;
          background-image: linear-gradient(45deg, transparent 50%, #53605b 50%), linear-gradient(135deg, #53605b 50%, transparent 50%);
          background-position: calc(100% - 18px) calc(50% - 2px), calc(100% - 12px) calc(50% - 2px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
        }
        .school-shortlist-save-template {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #4d5d59;
          font-size: 13px;
        }
        .school-shortlist-save-template input {
          width: 16px;
          height: 16px;
          accent-color: #1a8e52;
        }
        .school-shortlist-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 4px;
        }
        .school-shortlist-cancel-btn,
        .school-shortlist-confirm-btn {
          min-width: 120px;
          height: 42px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid #d9e0dd;
          background: #ffffff;
          color: #1f2b2c;
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .school-shortlist-confirm-btn {
          border-color: #148a52;
          background: #148a52;
          color: #ffffff;
        }

        .school-shortlist-success-backdrop {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          background: rgba(18, 24, 24, 0.2);
          z-index: 120;
        }
        .school-shortlist-success-modal {
          width: min(100%, 520px);
          padding: 28px 28px 22px;
          border: 1px solid #e3e7e5;
          border-radius: 22px;
          background: rgba(244, 246, 245, 0.97);
          box-shadow: 0 30px 60px rgba(23, 34, 31, 0.16);
          text-align: center;
        }
        .school-shortlist-success-icon-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }
        .school-shortlist-success-icon {
          display: grid;
          place-items: center;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #0f7d52;
          color: #ffffff;
          box-shadow: inset 0 0 0 8px rgba(255, 255, 255, 0.18);
        }
        .school-shortlist-success-modal h3 {
          margin: 0;
          color: #101b22;
          font-size: clamp(28px, 3vw, 46px);
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.04em;
        }
        .school-shortlist-success-text {
          margin: 18px auto 0;
          max-width: 380px;
          color: #40515d;
          font-size: 18px;
          line-height: 1.45;
        }
        .school-shortlist-success-text span {
          display: inline-block;
          margin-left: 2px;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(20, 138, 82, 0.12);
          color: #0f7d52;
          font-weight: 700;
        }
        .school-shortlist-success-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-top: 26px;
        }
        .school-shortlist-success-primary,
        .school-shortlist-success-secondary {
          min-height: 44px;
          padding: 0 20px;
          border-radius: 12px;
          border: 1px solid #d7ddd9;
          background: #ffffff;
          color: #1a2d2a;
          font: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }
        .school-shortlist-success-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-color: #0f7d52;
          background: #0f7d52;
          color: #ffffff;
        }
        .school-shortlist-success-secondary {
          background: #f8faf9;
        }
        .school-shortlist-success-notice {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 26px;
          padding: 14px 16px;
          border: 1px solid #dfe7e2;
          border-radius: 12px;
          background: #f5f7f6;
          color: #2c3b3e;
          text-align: left;
        }
        .school-shortlist-success-check {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(15, 125, 82, 0.12);
          color: #0f7d52;
        }
        .school-shortlist-success-notice strong {
          display: block;
          margin: 0 0 2px;
          font-size: 15px;
          font-weight: 700;
          color: #1e2c30;
        }
        .school-shortlist-success-notice p {
          margin: 0;
          color: #52636d;
          font-size: 14px;
          line-height: 1.4;
        }

        .school-job-form-page { color: #252b3d; }
        .school-job-form-breadcrumb { color: #7b8490; font-size: 11px; }
        .school-job-form-breadcrumb span { padding: 0 5px; color: #b1b8bd; }
        .school-job-form-title { margin: 7px 0 3px; font-size: 30px; font-weight: 700; line-height: 1.2; color: #1e2a33; }
        .school-job-form-subtitle { margin: 0 0 23px; color: #6a7682; font-size: 13px; }
        .school-job-form { display: flex; flex-direction: column; gap: 16px; }
        .school-job-form-card { display: grid; gap: 18px 16px; padding: 19px 17px; border: 1px solid #e8ecf0; border-radius: 14px; background: #fff; box-shadow: 0 4px 18px rgba(19, 28, 35, 0.02); }
        .school-job-basic-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .school-job-extra-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .school-job-form label, .school-job-form legend { display: block; color: #394353; font-size: 11px; font-weight: 600; }
        .school-job-form input, .school-job-form textarea, .school-job-form select, .school-select-field { box-sizing: border-box; width: 100%; margin-top: 6px; border: 1px solid #dfe6eb; border-radius: 11px; background: #fff; color: #384056; font: inherit; font-size: 12px; outline: none; }
        .school-job-form input, .school-job-form select { height: 40px; padding: 0 12px; }
        .school-job-form textarea { min-height: 110px; padding: 12px; resize: vertical; }
        .school-job-form input::placeholder, .school-job-form textarea::placeholder { color: #93a0ab; }
        .school-job-form input:focus, .school-job-form textarea:focus, .school-job-form select:focus, .school-select-field:focus { border-color: #1a873c; box-shadow: 0 0 0 3px rgba(28, 203, 67, .1); }
        .school-job-form fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
        .school-employment-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; margin-top: 6px; }
        .school-employment-options button { height: 40px; border: 1px solid #dfe6eb; border-radius: 11px; background: #fff; color: #384056; font: inherit; font-size: 11px; cursor: pointer; }
        .school-employment-options button.is-selected { border-color: #148038; background: #148038; color: #fff; }
        .school-input-with-icon { position: relative; }
        .school-input-with-icon > svg { position: absolute; top: 18px; left: 12px; z-index: 1; color: #526158; }
        .school-input-with-icon input { padding-left: 32px; }
        .school-job-description-card { gap: 17px; }
        .school-responsibility-input-row { display: flex; gap: 8px; margin-top: 6px; }
        .school-responsibility-input-row input { margin-top: 0 !important; flex: 1; }
        .school-responsibility-input-row button { display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0; height: 40px; padding: 0 14px; border: 1px solid #1a873c; border-radius: 9px; background: #ecfdf3; color: #166534; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
        .school-responsibility-input-row button:hover { background: #dcfce7; }
        .school-responsibility-list { display: grid; gap: 7px; margin: 10px 0 0; padding: 0; list-style: none; }
        .school-responsibility-list li { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 34px; padding: 7px 9px 7px 11px; border: 1px solid #dfe6eb; border-radius: 8px; background: #f8fafc; color: #384056; font-size: 12px; font-weight: 500; }
        .school-responsibility-list li button { display: grid; place-items: center; flex-shrink: 0; width: 24px; height: 24px; border: 0; border-radius: 50%; color: #64748b; background: transparent; cursor: pointer; }
        .school-responsibility-list li button:hover { color: #b91c1c; background: #fee2e2; }
        .school-feature-option { display: flex !important; align-items: center; gap: 9px; align-self: end; padding-top: 18px; color: #5b665f !important; }
        .school-feature-option input { width: 14px; height: 14px; margin: 0; accent-color: #148038; }
        .school-job-form-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 17px 0 0; }
        .school-job-form-actions button { min-width: 120px; height: 40px; padding: 0 18px; border: 1px solid #dfe6eb; border-radius: 999px; background: #fff; color: #384056; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
        .school-job-form-actions button:last-child { border-color: #1ccb43; background: #1ccb43; color: #07331b; }
        .school-job-form-actions button:disabled { cursor: wait; opacity: .6; }

        .school-jobs-page { color: #252b3d; }
        .school-jobs-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; }
        .school-jobs-heading h2 { margin: 0; color: #202b3d; font-size: 26px; font-weight: 700; }
        .school-jobs-heading button { display: inline-flex; align-items: center; gap: 7px; padding: 10px 16px; border: 0; border-radius: 999px; background: #1ccb43; color: #07331b; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
        .school-jobs-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 20px; padding: 0 0 11px; border-bottom: 1px solid #e8edf0; }
        .school-job-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .school-job-filters button { min-height: 33px; padding: 0 17px; border: 1px solid #d8e0dc; border-radius: 999px; background: #fff; color: #77838c; font: inherit; font-size: 11px; cursor: pointer; }
        .school-job-filters button.is-active { border-color: #117b35; background: #117b35; color: #fff; }
        .school-jobs-toolbar-right { display: flex; align-items: center; gap: 28px; color: #718078; font-size: 11px; white-space: nowrap; }
        .school-jobs-toolbar-right button { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; background: transparent; color: #718078; font: inherit; font-size: 11px; cursor: pointer; }
        .school-job-list-panel { padding: 0 0 14px; background: transparent; }
        .school-job-row {
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr) auto;
          gap: 17px;
          align-items: center;
          min-height: 74px;
          margin-bottom: 10px;
          padding: 14px 18px;
          border: 1px solid #e4e9ee;
          border-radius: 9px;
          background: #fff;
          box-shadow: none;
          transition: border-color .18s ease, box-shadow .18s ease;
        }
        .school-job-row:hover { border-color: #cad8d0; box-shadow: 0 4px 16px rgba(15, 23, 42, .04); }
        .school-job-row-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #e2f0e3;
          color: #176e39;
        }
        .school-job-row-icon--draft {
          background: #dfeaf8;
          color: #4c5f7d;
        }
        .school-job-row-icon--filled {
          background: #edf0f0;
          color: #7d898c;
        }
        .school-job-row-icon--pending, .school-job-row-icon--under-review { background: #fff4d2; color: #ad7912; }
        .school-job-row-icon--rejected { background: #ffe8e6; color: #cf584c; }
        .school-job-row-icon--closed { background: #edf0f4; color: #748092; }
        .school-job-row-main { min-width: 0; }
        .school-job-row-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .school-job-row-title h3 {
          overflow: hidden;
          margin: 0;
          color: #1d2433;
          font-size: 14px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .school-job-row-title-button {
          overflow: hidden;
          padding: 0;
          border: 0;
          background: transparent;
          color: #1d2433;
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
        }
        .school-job-row-status {
          padding: 4px 10px;
          border-radius: 999px;
          background: #dff3e5;
          color: #247544;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }
        .school-job-row-status--under-review { background: #fff1bd; color: #a66a11; }
        .school-job-row-status--draft {
          background: #e9edf1;
          color: #5d6f7e;
        }
        .school-job-row-status--filled { background: #ffe1e1; color: #c55e5e; }
        .school-job-row-status--pending, .school-job-row-status--under-review { background: #fff1bd; color: #a66a11; }
        .school-job-row-status--rejected { background: #ffe1e1; color: #c55e5e; }
        .school-job-row-status--closed { background: #e9edf1; color: #5d6f7e; }
        .school-job-row-meta {
          display: flex;
          align-items: center;
          gap: 13px;
          color: #6b7682;
          font-size: 10px;
        }
        .school-job-row-meta span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .school-job-row-meta .school-job-applicants {
          color: #247544;
          font-weight: 700;
        }
        .school-job-detail-page {
          width: 100%;
          color: #1f2a33;
        }
        .school-job-detail-back { display: flex; align-items: center; gap: 5px; margin-bottom: 17px; color: #71808a; font-size: 10px; }
        .school-job-detail-back button { padding: 0; color: #617078; font: inherit; cursor: pointer; }
        .school-job-detail-back strong { color: #56646d; font-weight: 600; }
        .school-job-detail-hero { display: grid; grid-template-columns: minmax(0, 1fr) 190px; gap: 22px; min-height: 205px; padding: 18px; border: 1px solid #dce5df; border-radius: 8px; background: #fff; }
        .school-job-detail-hero-main { min-width: 0; }
        .school-job-detail-hero-main > h2 { margin: 17px 0 15px; color: #202b3d; font-size: 16px; font-weight: 600; }
        .school-job-detail-meta-row { gap: 14px; margin-bottom: 0; color: #66757d; font-size: 10px; }
        .school-job-detail-status { display: inline-flex; align-items: center; min-height: 20px; padding: 0 8px; border-radius: 999px; background: #dff3e5; color: #247544; font-size: 9px; font-weight: 700; text-transform: capitalize; }
        .school-job-detail-status--pending, .school-job-detail-status--under-review { background: #fff1bd; color: #a66a11; }
        .school-job-detail-status--rejected { background: #ffe1e1; color: #c55e5e; }
        .school-job-detail-status--closed { background: #e9edf1; color: #5d6f7e; }
        .school-job-detail-actions { gap: 8px; margin-top: 0; }
        .school-job-detail-primary, .school-job-detail-secondary, .school-job-detail-close { min-height: 29px; padding: 0 12px; border-radius: 6px; font-size: 10px; }
        .school-job-detail-primary { box-shadow: none; }
        .school-job-detail-close { border: 1px solid #f3c8c3; background: #fff; color: #c44336; font: inherit; font-size: 10px; font-weight: 700; cursor: pointer; }
        .school-job-timeline { padding: 14px; border: 1px solid #dce5df; border-radius: 8px; background: #fff; }
        .school-job-timeline h3 { margin: 0 0 12px; color: #68747d; font-size: 9px; font-weight: 700; text-transform: uppercase; }
        .school-job-timeline-item { position: relative; display: flex; gap: 9px; padding: 0 0 13px; }
        .school-job-timeline-item:last-child { padding-bottom: 0; }
        .school-job-timeline-item:not(:last-child)::before { content: ''; position: absolute; top: 10px; left: 4px; width: 1px; height: calc(100% - 5px); background: #d5dfd8; }
        .school-job-timeline-item > span { position: relative; z-index: 1; width: 9px; height: 9px; margin-top: 2px; border: 2px solid #99a69e; border-radius: 50%; background: #fff; }
        .school-job-timeline-item > span.is-current { border-color: #198344; background: #198344; }
        .school-job-timeline-item small, .school-job-timeline-item strong { display: block; }
        .school-job-timeline-item small { color: #87929a; font-size: 8px; }
        .school-job-timeline-item strong { color: #53616b; font-size: 9px; font-weight: 600; }
        .school-job-detail-body { min-height: 420px; margin-top: 20px; padding: 18px; border: 1px solid #dce5df; border-radius: 8px; background: #fff; }
        .school-job-detail-section { padding: 0 0 18px; }
        .school-job-detail-section:last-child { padding-bottom: 0; }
        .school-job-detail-section h3 { padding-left: 8px; border-left: 3px solid #1c8a47; font-size: 11px; }
        .school-job-detail-section p, .school-job-detail-section li { color: #52606b; font-size: 11px; line-height: 1.65; }
        .school-job-detail-check-list { list-style: none; padding-left: 0; }
        .school-job-detail-check-list li { position: relative; padding-left: 19px; }
        .school-job-detail-check-list li::before { content: '✓'; position: absolute; left: 0; color: #16833e; font-weight: 700; }
        @media (max-width: 680px) {
          .school-job-detail-hero { grid-template-columns: 1fr; padding: 15px; }
          .school-job-detail-hero-main > h2 { font-size: 18px; }
          .school-job-detail-meta-row { gap: 9px; }
          .school-job-detail-actions { display: grid; grid-template-columns: 1fr 1fr; }
          .school-job-detail-close { grid-column: span 2; }
          .school-job-timeline { order: 2; }
          .school-job-detail-body { padding: 15px; }
        }
        .school-job-detail-shell {
          border: 1px solid #ebeeef;
          border-radius: 18px;
          background: #f5f5f3;
          overflow: hidden;
        }
        .school-job-detail-header-area {
          padding: 32px 32px 20px;
          background: #f5f5f3;
        }
        .school-job-detail-school-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .school-job-detail-school-logo {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0f7d52 0%, #1f8f5e 100%);
          color: #fff;
          overflow: hidden;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          box-shadow: 0 8px 18px rgba(16, 90, 58, 0.15);
        }
        .school-job-detail-school-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .school-job-detail-school-name {
          color: #1e2a2f;
          font-size: 17px;
          font-weight: 700;
        }
        .school-job-detail-title-wrap {
          margin-bottom: 12px;
        }
        .school-job-detail-title-wrap h2 {
          margin: 0;
          color: #1d2433;
          font-size: clamp(28px, 2.4vw, 44px);
          font-weight: 700;
          line-height: 1.2;
        }
        .school-job-detail-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 22px;
          color: #68747d;
          font-size: 13px;
        }
        .school-job-detail-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .school-job-detail-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 8px;
        }
        .school-job-detail-primary,
        .school-job-detail-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          padding: 0 18px;
          border: 1px solid transparent;
          border-radius: 999px;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .school-job-detail-primary {
          background: #1d7f4c;
          color: #ffffff;
          box-shadow: 0 10px 18px rgba(29, 127, 76, 0.18);
        }
        .school-job-detail-secondary {
          background: rgba(29, 127, 76, 0.12);
          border-color: rgba(29, 127, 76, 0.18);
          color: #0f7d52;
        }
        .school-job-detail-body {
          padding: 6px 32px 24px;
          background: #f5f5f3;
        }
        .school-job-detail-section {
          padding: 0 0 22px;
        }
        .school-job-detail-section h3 {
          margin: 0 0 10px;
          color: #1d2433;
          font-size: 15px;
          font-weight: 700;
        }
        .school-job-detail-section p,
        .school-job-detail-section li {
          color: #2f3d4b;
          font-size: 15px;
          line-height: 1.7;
        }
        .school-job-detail-section p {
          max-width: 880px;
          margin: 0;
        }
        .school-job-detail-check-list,
        .school-job-detail-bullets {
          margin: 0;
          padding-left: 20px;
        }
        .school-job-detail-check-list li,
        .school-job-detail-bullets li {
          margin-bottom: 8px;
        }
        .school-job-detail-check-list li::marker {
          color: #1d7f4c;
        }
        .school-job-detail-page .school-job-detail-body {
          min-height: 420px;
          margin-top: 20px;
          padding: 18px;
          border: 1px solid #dce5df;
          border-radius: 8px;
          background: #ffffff;
        }
        .school-job-detail-page .school-job-detail-section { padding: 0 0 18px; }
        .school-job-detail-page .school-job-detail-section:last-child { padding-bottom: 0; }
        .school-job-detail-page .school-job-detail-section h3 { margin: 0 0 10px; padding-left: 8px; border-left: 3px solid #1c8a47; color: #263342; font-size: 11px; font-weight: 700; }
        .school-job-detail-page .school-job-detail-section p,
        .school-job-detail-page .school-job-detail-section li { color: #52606b; font-size: 11px; line-height: 1.65; }
        .school-job-detail-page .school-job-detail-section p { max-width: 510px; }
        .school-job-detail-page .school-job-detail-check-list { margin: 0; padding-left: 0; list-style: none; }
        .school-job-detail-page .school-job-detail-check-list li { position: relative; padding-left: 19px; }
        .school-job-detail-page .school-job-detail-check-list li::before { content: '✓'; position: absolute; left: 0; color: #16833e; font-weight: 700; }
        .school-job-detail-page .school-job-detail-bullets { margin: 0; padding-left: 18px; }
        .school-job-detail-page .school-job-detail-bullets li { margin-bottom: 6px; }
        .school-job-row-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          min-width: 150px;
        }
        .school-job-row-actions button {
          border: 0;
          background: transparent;
          font: inherit;
          cursor: pointer;
        }
        .school-job-view, .school-job-continue, .school-job-details {
          color: #2f9d53;
          font-size: 12px;
          font-weight: 600;
        }
        .school-job-details { min-height: 29px; padding: 0 11px; border: 1px solid #d8e3da !important; border-radius: 999px; }
        .school-job-view-applicants { min-height: 29px; padding: 0 12px; border-radius: 999px; background: #16833e !important; color: #fff; font-size: 11px; font-weight: 700; }
        .school-job-continue {
          color: #2e9e57;
          font-size: 16px;
          font-weight: 600;
        }
        .school-job-discard {
          color: #d13d3d;
          font-size: 16px;
          font-weight: 600;
        }
        .school-job-delete-square {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(220, 82, 82, 0.25);
          border-radius: 10px;
          background: rgba(252, 88, 88, 0.08);
          color: #d13d3d;
          cursor: pointer;
        }
        .school-job-archive {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid #d8e0d8 !important;
          border-radius: 999px;
          color: #899399;
          font-size: 12px;
        }
        .school-job-more-wrap { position: relative; }
        .school-job-more {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid transparent;
          border-radius: 999px;
          background: transparent;
          color: #252b3d;
          cursor: pointer;
        }
        .school-job-more:hover, .school-job-more[aria-expanded="true"] { background: #f1f5f3; color: #16733a; }
        .school-job-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          z-index: 30;
          display: flex;
          flex-direction: column;
          width: 200px;
          padding: 7px;
          border: 1px solid #eceef0;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
        }
        .school-job-menu button {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 11px 12px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #1d2433;
          font: inherit;
          font-size: 12px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
        }
        .school-job-menu button:hover { background: #f5f7f6; }
        .school-job-menu-delete { color: #d93c3c !important; }
        .school-job-menu-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #f6f7f7;
          color: inherit;
        }
        .school-job-menu-delete .school-job-menu-icon {
          background: rgba(217, 60, 60, 0.08);
          color: #d93c3c;
        }
        .school-teachers-page {
          width: 100%;
          max-width: 1220px;
          padding: 12px 0 0;
          color: #1f2a33;
        }
        .school-teachers-hero {
          padding: 18px 18px 0;
        }
        .school-teachers-hero h1 {
          margin: 0;
          font-size: clamp(2.25rem, 3vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.06em;
          line-height: 1.08;
          color: #171f29;
        }
        .school-teachers-hero p {
          margin: 10px 0 0;
          color: #5c6863;
          font-size: 17px;
          line-height: 1.4;
        }
        .school-teachers-search-shell {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 22px;
          padding: 14px 16px;
          border: 1px solid #dfe4df;
          border-radius: 18px;
          background: #f8f8f8;
        }
        .school-teachers-search {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
          height: 52px;
          border: 1px solid #dfe4df;
          border-radius: 12px;
          background: #fff;
          padding: 0 18px 0 42px;
        }
        .school-teachers-search-icon {
          position: absolute;
          left: 16px;
          color: #5c6863;
          font-size: 20px;
          line-height: 1;
        }
        .school-teachers-search input {
          width: 100%;
          border: 0;
          background: transparent;
          font: inherit;
          font-size: 14px;
          color: #1f2a33;
          outline: none;
        }
        .school-teachers-search input::placeholder {
          color: #6d7d7b;
        }
        .school-teachers-location-button,
        .school-teachers-search-btn,
        .school-teachers-filter-tag,
        .school-teachers-sort-btn,
        .school-teachers-load-more {
          font: inherit;
          cursor: pointer;
        }
        .school-teachers-location-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 52px;
          padding: 0 18px;
          border: 1px solid #dfe4df;
          border-radius: 12px;
          background: #fff;
          color: #27353d;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }
        .school-teachers-location-dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #147a49;
          box-shadow: 0 0 0 3px rgba(20, 122, 73, 0.12);
        }
        .school-teachers-caret {
          color: #5c6863;
          font-size: 18px;
          line-height: 1;
        }
        .school-teachers-search-btn {
          height: 52px;
          padding: 0 28px;
          border: 0;
          border-radius: 12px;
          background: #14792D;
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
        }
        .school-teachers-dropdown-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .school-teachers-filter-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 18px;
          padding: 0 4px;
        }
        .school-teachers-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 22;
          display: flex;
          flex-direction: column;
          min-width: 180px;
          padding: 8px;
          border: 1px solid #dfe4df;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 18px 40px rgba(17, 24, 39, 0.12);
        }
        .school-teachers-menu--compact {
          min-width: 160px;
        }
        .school-teachers-menu-item {
          border: 0;
          background: transparent;
          padding: 10px 12px;
          border-radius: 8px;
          color: #2c3941;
          text-align: left;
          font: inherit;
          font-size: 14px;
          cursor: pointer;
        }
        .school-teachers-menu-item:hover {
          background: #f3f6f4;
        }
        .school-teachers-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 36px;
          padding: 0 16px;
          border: 1px solid #d5dbd7;
          border-radius: 999px;
          background: #f4f7f3;
          color: #3d4a4d;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .school-teachers-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 30px;
          padding: 0 4px;
        }
        .school-teachers-header-row h2 {
          margin: 0;
          font-size: clamp(1.7rem, 2.4vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #171f29;
        }
        .school-teachers-sort-btn {
          border: 0;
          background: transparent;
          color: #46555f;
          font-size: 16px;
          font-weight: 500;
        }
        .school-teachers-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-top: 18px;
        }
        .school-teachers-empty-state {
          margin-top: 18px;
          border: 1px dashed #d7dcd8;
          border-radius: 14px;
          background: #f8faf8;
          padding: 24px;
          text-align: center;
          color: #536267;
          font-size: 15px;
        }
        .school-teacher-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          padding: 22px 18px 18px;
          border: 1px solid #dfe4df;
          border-radius: 16px;
          background: #fff;
        }
        .school-teacher-card-main {
          display: flex;
          flex: 1;
          min-width: 0;
          flex-direction: column;
          gap: 14px;
        }
        .school-teacher-badge {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 6px 10px;
          border-radius: 999px;
          background: #dff1e8;
          color: #207a4a;
          font-size: 12px;
          font-weight: 700;
        }
        .school-teacher-profile-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .school-teacher-avatar {
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          color: #1d2f2c;
          font-size: 15px;
          font-weight: 800;
          box-shadow: inset 0 0 0 1px rgba(15, 35, 50, 0.04);
        }
        .school-teacher-info {
          min-width: 0;
          flex: 1;
        }
        .school-teacher-name-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 8px;
        }
        .school-teacher-name {
          font-size: clamp(1.15rem, 1.5vw, 1.7rem);
          font-weight: 800;
          line-height: 1.2;
          color: #171f29;
        }
        .school-teacher-meta-pill {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          background: #f0f3f1;
          color: #5e6a61;
          font-size: 12px;
          font-weight: 600;
        }
        .school-teacher-role {
          margin: 0;
          color: #2b3a3d;
          font-size: 16px;
          font-weight: 600;
        }
        .school-teacher-summary {
          margin: 10px 0 0;
          max-width: 760px;
          color: #5f6e6b;
          font-size: 14px;
          line-height: 1.5;
        }
        .school-teacher-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 180px;
        }
        .school-teacher-primary-btn,
        .school-teacher-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 28px;
          border: 1px solid transparent;
          font: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }
        .school-teacher-primary-btn {
          background: #2AE156;
          color: #000000;
          border-color: #2AE156;
        }
        .school-teacher-secondary-btn {
          background: #ffffff;
          border-color: #dfe4df;
          color: #206D00;
        }
        .school-teachers-load-more-wrap {
          display: flex;
          justify-content: center;
          margin-top: 20px;
          padding-bottom: 18px;
        }
        .school-teachers-load-more {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 190px;
          min-height: 46px;
          padding: 0 22px;
          border: 1px solid #dfe4df;
          border-radius: 10px;
          background: #f6f8f7;
          color: #212d39;
          font-size: 16px;
          font-weight: 700;
        }

        .school-job-applicants-page {
          width: 100%;
          color: #1f2a33;
          max-width: 1080px;
        }
        .school-job-applicants-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #66757d;
          font-size: 12px;
          font-weight: 600;
        }
        .school-job-applicants-breadcrumb button {
          border: 0;
          background: transparent;
          padding: 0;
          color: #4d5d66;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .school-job-applicants-breadcrumb span {
          color: #a0acb4;
        }
        .school-job-applicants-title {
          margin: 14px 0 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0;
          color: #171f29;
        }
        .school-job-applicants-subtitle {
          margin: 5px 0 0;
          color: #5b6c72;
          font-size: 11px;
        }
        .school-job-applicants-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-top: 28px;
          padding: 14px 16px;
          border: 1px solid #dce5df;
          border-radius: 8px;
          background: #ffffff;
        }
        .school-job-applicants-filters {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
        }
        .school-job-applicants-filters button,
        .school-job-filter-button,
        .school-job-clear-filters {
          font: inherit;
          cursor: pointer;
        }
        .school-job-applicants-filters button {
          min-height: 25px;
          padding: 0 12px;
          border: 0;
          border-radius: 4px;
          background: #e9eff9;
          color: #485d5c;
          font-size: 9px;
          font-weight: 700;
        }
        .school-job-applicants-filters button.is-active {
          border-color: #1f8f53;
          background: #1f8f53;
          color: #ffffff;
        }
        .school-job-filter-menu-wrap {
          position: relative;
        }
        .school-job-filter-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 25px;
          padding: 0 10px;
          border: 1px solid #cad5df;
          border-radius: 4px;
          background: #ffffff;
          color: #46555f;
          font-size: 9px;
          font-weight: 600;
        }
        .school-job-filter-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 30;
          display: flex;
          flex-direction: column;
          min-width: 162px;
          padding: 8px;
          border: 1px solid #e2e8e5;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
        }
        .school-job-filter-menu button {
          border: 0;
          background: transparent;
          padding: 10px 12px;
          border-radius: 10px;
          color: #2d3a43;
          font: inherit;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
        }
        .school-job-filter-menu button:hover {
          background: #f3f7f4;
        }
        .school-job-clear-filters {
          border: 0;
          background: transparent;
          color: #0f7d4d;
          font-size: 12px;
          font-weight: 700;
        }
        .school-job-applicants-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 16px;
        }
        .school-job-applicant-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 15px 16px;
          border: 1px solid #dce5df;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(17, 24, 39, 0.03);
        }
        .school-job-applicant-main {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(120px, 1fr) minmax(140px, 1fr) minmax(120px, 0.9fr);
          gap: 18px;
          align-items: center;
          flex: 1;
          min-width: 0;
        }
        .school-job-applicant-name-block {
          min-width: 0;
        }
        .school-job-applicant-name-block h4 {
          margin: 0;
          color: #1b2430;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.04em;
        }
        .school-job-applicant-role {
          margin-top: 2px;
          color: #4f5f66;
          font-size: 9px;
          font-weight: 600;
        }
        .school-job-applicant-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 7px;
        }
        .school-job-applicant-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 20px;
          padding: 0 8px;
          border-radius: 999px;
          background: #eef3f2;
          color: #4a5e69;
          font-size: 9px;
          font-weight: 700;
        }
        .school-job-applicant-badge--green {
          background: #eafaf1;
          color: #0f7d52;
        }
        .school-job-applicant-column {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .school-job-applicant-label {
          color: #6f7c83;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .school-job-applicant-column strong {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #1f2a33;
          font-size: 10px;
          font-weight: 700;
        }
        .school-job-location-pin {
          color: #7d8a8d;
          font-size: 16px;
          line-height: 1;
        }
        .school-job-applicant-column--status {
          align-items: flex-start;
        }
        .school-job-applicant-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 21px;
          padding: 0 8px;
          border-radius: 3px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
        .school-job-applicant-status--shortlisted {
          background: rgba(17, 129, 80, 0.12);
          color: #0f7d52;
        }
        .school-job-applicant-status--under-review,
        .school-job-applicant-status--reviewed {
          background: rgba(228, 168, 39, 0.14);
          color: #a66b00;
        }
        .school-job-applicant-status--rejected {
          background: rgba(217, 48, 37, 0.12);
          color: #c7342d;
        }
        .school-job-applicant-status--pending {
          background: rgba(77, 93, 101, 0.1);
          color: #455861;
        }
        .school-job-applicant-status--hired {
          background: rgba(20, 137, 82, 0.12);
          color: #0a6e4b;
        }
        .school-job-applicant-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .school-job-applicant-more-wrap {
          position: relative;
        }
        .school-job-applicant-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 12px);
          z-index: 30;
          display: flex;
          flex-direction: column;
          width: 220px;
          padding: 8px;
          border: 1px solid #eceef0;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
        }
        .school-job-applicant-menu button {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px 14px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: #1d2433;
          font: inherit;
          font-size: 16px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
        }
        .school-job-applicant-menu button:hover {
          background: #f5f7f6;
        }
        .school-job-applicant-menu-delete {
          color: #d93c3c !important;
        }
        .school-job-applicant-menu-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #f6f7f7;
          color: #1d2433;
        }
        .school-job-applicant-menu-delete .school-job-applicant-menu-icon {
          background: rgba(217, 60, 60, 0.08);
          color: #d93c3c;
        }
        .school-job-applicant-view-btn {
          min-height: 29px;
          padding: 0 12px;
          border: 1px solid #1a8e53;
          border-radius: 5px;
          background: #fff;
          color: #197a4a;
          font: inherit;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }
        .school-job-applicant-more {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 29px;
          border: 0;
          border-radius: 4px;
          background: transparent;
          color: #1b2430;
          font-size: 18px;
          cursor: pointer;
        }
        .school-job-applicants-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 18px;
          padding-top: 8px;
          color: #657581;
          font-size: 12px;
        }
        .school-job-applicants-empty { margin: 0; padding: 26px; border: 1px dashed #ccd8d1; border-radius: 8px; color: #64748b; font-size: 12px; text-align: center; }
        .school-job-applicant-pagination {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .school-job-applicant-pagination button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          padding: 0 10px;
          border: 1px solid #dfe5e3;
          border-radius: 8px;
          background: #ffffff;
          color: #4a5d66;
          font: inherit;
          font-size: 12px;
          cursor: pointer;
        }
        .school-job-applicant-pagination button.is-active {
          border-color: #1d8c53;
          background: #1d8c53;
          color: #ffffff;
        }
        .school-job-pager-nav {
          min-width: 30px !important;
          font-size: 18px !important;
          line-height: 1;
        }

        @media (max-width: 900px) {
          .school-teachers-page {
            padding-top: 8px;
          }
          .school-teachers-search-shell {
            flex-wrap: wrap;
          }
          .school-teachers-search {
            flex-basis: 100%;
          }
          .school-teachers-dropdown-wrapper {
            flex: 1 1 0;
            min-width: 0;
          }
          .school-teachers-location-button,
          .school-teachers-search-btn,
          .school-teachers-filter-tag {
            width: 100%;
            flex: 1;
          }
          .school-teachers-menu {
            min-width: 100%;
            width: 100%;
          }
          .school-teacher-card {
            flex-direction: column;
            align-items: stretch;
          }
          .school-teacher-actions {
            width: 100%;
            min-width: 0;
            flex-direction: row;
          }
          .school-teacher-primary-btn,
          .school-teacher-secondary-btn {
            flex: 1;
          }
        }

        @media (max-width: 640px) {
          .school-teachers-hero {
            padding-left: 4px;
            padding-right: 4px;
          }
          .school-teachers-search-shell {
            padding: 12px;
          }
          .school-teachers-header-row {
            flex-direction: column;
            align-items: flex-start;
            margin-top: 22px;
          }
          .school-teacher-card {
            padding: 16px 12px;
          }
          .school-teacher-profile-row {
            gap: 12px;
          }
          .school-teacher-name-row {
            gap: 8px;
          }
          .school-teacher-summary {
            font-size: 13px;
          }
          .school-teacher-actions {
            flex-direction: column;
          }
          .school-teacher-primary-btn,
          .school-teacher-secondary-btn {
            width: 100%;
          }
        }


        





        @media (max-width: 768px) {
          .school-job-applicants-page {
            padding-top: 4px;
          }
          .school-job-applicants-breadcrumb {
            margin-bottom: 8px;
            font-size: 11px;
          }
          .school-job-applicants-title {
            font-size: 28px;
            letter-spacing: -0.04em;
          }
          .school-job-applicants-subtitle {
            margin: 8px 0 18px;
            font-size: 13px;
          }
          .school-job-applicants-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 12px;
          }
          .school-job-applicants-filters {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .school-job-applicants-filters button,
          .school-job-filter-button {
            width: 100%;
            justify-content: center;
            text-align: center;
            font-size: 11px;
          }
          .school-job-filter-menu-wrap {
            width: 100%;
          }
          .school-job-filter-menu {
            right: 0;
            left: auto;
            width: 100%;
            min-width: 0;
          }
          .school-job-clear-filters {
            align-self: flex-end;
            padding: 6px 10px;
            font-size: 11px;
          }
          .school-job-applicants-list {
            margin-top: 16px;
            gap: 12px;
          }
          .school-job-applicant-card {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
            padding: 14px 12px;
          }
          .school-job-applicant-main {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .school-job-applicant-name-block h4 {
            font-size: 18px;
          }
          .school-job-applicant-role {
            font-size: 11px;
          }
          .school-job-applicant-column {
            gap: 6px;
          }
          .school-job-applicant-label {
            font-size: 10px;
            letter-spacing: 0.08em;
          }
          .school-job-applicant-column strong {
            font-size: 12px;
          }
          .school-job-applicant-status {
            min-width: 88px;
            width: fit-content;
          }
          .school-job-applicant-actions {
            justify-content: stretch;
            gap: 10px;
          }
          .school-job-applicant-view-btn {
            flex: 1;
            width: 100%;
            padding: 11px 12px;
            font-size: 12px;
          }
          .school-job-applicant-more {
            width: 42px;
            height: 42px;
            font-size: 24px;
          }
          .school-job-applicants-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            padding-top: 14px;
            margin-top: 14px;
          }
          .school-job-applicant-pagination {
            flex-wrap: wrap;
          }
        }

        .school-overview {
          color: #20252b;
          font-family: 'DM Sans', sans-serif;
        }
        .school-overview-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(260px, 1fr);
          gap: 16px;
          margin-bottom: 14px;
        }
        .school-welcome-panel,
        .school-profile-card,
        .school-overview-section {
          border: 1px solid #d9dddf;
          border-radius: 18px;
          background: #fff;
        }
        .school-welcome-panel { padding: 24px 22px; }
        .school-welcome-panel h2 {
          margin: 0 0 7px;
          font-size: 22px;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: 0;
        }
        .school-welcome-panel p {
          margin: 0;
          color: #62686d;
          font-size: 13px;
          line-height: 1.5;
        }
        .school-overview-actions { display: flex; gap: 10px; margin-top: 16px; }
        .school-overview-actions button,
        .school-section-heading button,
        .school-review-button,
        .school-schedule-button {
          border: 1px solid #d9dddf;
          border-radius: 999px;
          background: #fff;
          color: #20252b;
          font: inherit;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }
        .school-overview-actions button { padding: 9px 14px; }
        .school-overview-actions button:first-child { display: inline-flex; align-items: center; gap: 5px; border-color: #1ccb43; background: #1ccb43; }
        .school-profile-card { padding: 25px 16px 16px; }
        .school-profile-heading { display: flex; align-items: center; gap: 10px; }
        .school-profile-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #e1f0d5; color: #356947; }
        .school-profile-heading div { display: flex; flex-direction: column; gap: 3px; }
        .school-profile-heading strong { font-size: 13px; font-weight: 500; }
        .school-profile-heading span:last-child { color: #6c7276; font-size: 11px; }
        .school-profile-progress-label { display: flex; justify-content: space-between; margin-top: 16px; font-size: 11px; }
        .school-profile-progress-label strong { font-weight: 700; }
        .school-profile-progress { height: 5px; margin-top: 5px; overflow: hidden; border-radius: 999px; background: #e2e5e6; }
        .school-profile-progress span { display: block; width: 75%; height: 100%; border-radius: inherit; background: #073e32; }
        .school-profile-card p { display: flex; align-items: center; gap: 4px; margin: 10px 0 0; color: #62686d; font-size: 10px; }
        .school-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 30px; }
        .school-stat-card { position: relative; min-height: 105px; padding: 13px 15px; border: 1px solid #d9dddf; border-radius: 18px; background: #f5f6f7; }
        .school-stat-card > span { display: block; font-size: 11px; }
        .school-stat-card > svg { position: absolute; top: 13px; right: 14px; color: #c5cacc; }
        .school-stat-card > strong { display: block; margin-top: 43px; font-size: 29px; font-weight: 700; line-height: 1; }
        .school-overview-section { overflow: hidden; margin-bottom: 14px; }
        .school-section-heading { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; }
        .school-section-heading h3 { margin: 0; font-size: 15px; font-weight: 500; }
        .school-section-heading button { border: 0; padding: 0; font-size: 11px; }
        .school-section-heading button span { font-size: 14px; }
        .school-applicant-table { border-top: 1px solid #e1e4e5; }
        .school-table-row { display: grid; grid-template-columns: 1.2fr 1.25fr .7fr .65fr; align-items: center; min-height: 42px; padding: 0 16px; border-bottom: 1px solid #e1e4e5; color: #454b50; font-size: 11px; }
        .school-table-row:last-child { border-bottom: 0; }
        .school-table-head { min-height: 29px; background: #fafbfb; color: #747b80; font-size: 10px; }
        .school-applicant-name { display: flex; align-items: center; gap: 8px; color: #292f34; }
        .school-applicant-name i { display: grid; place-items: center; width: 21px; height: 21px; border-radius: 50%; background: #cfe8db; color: #355b49; font-size: 7px; font-style: normal; font-weight: 700; }
        .school-status { width: fit-content; padding: 4px 8px; border-radius: 999px; background: #dfe3e6; color: #5d666c; font-size: 9px; font-weight: 700; }
        .school-status-shortlisted { background: #dcebd1; color: #41673a; }
        .school-status-interviewing { background: #dbeafe; color: #1d4ed8; }
        .school-status-new { background: #073e32; color: #fff; }
        .school-review-button { padding: 5px 10px; justify-self: start; border-radius: 3px; font-size: 10px; }
        .school-posting-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 0 16px 16px; }
        .school-posting-card { position: relative; min-height: 84px; padding: 13px; border: 1px solid #d9dddf; border-radius: 8px; }
        .school-posting-card > div:first-child { display: flex; flex-direction: column; gap: 4px; }
        .school-posting-card strong { font-size: 12px; font-weight: 500; }
        .school-posting-card span { color: #62686d; font-size: 10px; }
        .school-posting-icon { position: absolute; top: 13px; right: 13px; padding: 5px; width: 25px; height: 25px; border-radius: 4px; background: #e4edff; color: #667d9d; }
        .school-posting-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; }
        .school-posting-footer span { display: flex; align-items: center; gap: 4px; color: #263f36; font-weight: 700; }
        .school-posting-footer small { color: #62686d; font-size: 9px; }
        .school-interviews-section { padding-bottom: 14px; }
        .school-interviews-section > .school-section-heading { padding-bottom: 12px; }
        .school-interview-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin: 0 16px 10px;
          padding: 12px 12px 11px;
          border: 1px solid #e3e7e9;
          border-radius: 12px;
          background: linear-gradient(180deg, #ffffff 0%, #f8faf9 100%);
          box-shadow: 0 8px 18px rgba(18, 26, 31, 0.03);
        }
        .school-interview-main {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .school-interview-icon {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #dff5e8;
          color: #1a7a54;
          flex-shrink: 0;
        }
        .school-interview-copy {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 3px;
        }
        .school-interview-copy strong {
          color: #20252b;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.3;
        }
        .school-interview-copy small {
          color: #686f73;
          font-size: 10px;
          line-height: 1.4;
        }
        .school-interview-time {
          flex-shrink: 0;
          color: #20252b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .school-empty-interviews { display: flex; align-items: center; gap: 10px; margin: 0 16px 10px; padding: 12px; border-radius: 8px; background: #f5f6f7; }
        .school-empty-interviews > span { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: #dcefe5; color: #346850; }
        .school-empty-interviews div { display: flex; flex-direction: column; gap: 3px; }
        .school-empty-interviews strong { font-size: 11px; font-weight: 600; }
        .school-empty-interviews small { color: #62686d; font-size: 10px; }
        .school-schedule-button { display: block; width: calc(100% - 32px); margin: 0 16px; padding: 7px; border-radius: 5px; font-size: 10px; }
        .school-desktop-notifications { display: none; }
        .school-notifications-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .school-notifications-heading h2 { margin: 0; color: #20252b; font-size: 28px; font-weight: 700; }
        .school-notifications-heading p { display: flex; align-items: center; gap: 10px; margin: 6px 0 0; color: #62686d; font-size: 12px; }
        .school-notifications-heading p strong { padding: 4px 10px; border-radius: 999px; background: #22dd55; color: #07331b; font-size: 9px; }
        .school-notifications-heading button { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: #16843d; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
        .school-notifications-panel { padding: 32px 35px 20px; border-radius: 28px; background: #fff; box-shadow: 0 8px 25px rgba(23, 34, 56, .05); }
        .school-notifications-panel > h3 { margin: 0 0 17px; color: #20252b; font-size: 15px; font-weight: 600; }
        .school-notifications-panel > h3:not(:first-child) { margin-top: 35px; }
        .school-notification-highlight { display: grid; grid-template-columns: 46px minmax(0, 1fr) auto; gap: 18px; align-items: start; width: 100%; margin-bottom: 8px; padding: 20px; border: 0; border-radius: 24px; background: #f5f5f7; color: inherit; text-align: left; cursor: pointer; }
        .school-notification-highlight--green { background: #f4f4f6; }
        .school-notification-highlight--red { background: #f4f4f6; }
        .school-notification-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #edf0ed; color: #526158; }
        .school-notification-highlight--green .school-notification-icon { background: #dff3e6; color: #467a4c; }
        .school-notification-highlight--red .school-notification-icon { background: #ffd9d6; color: #bb2027; }
        .school-notification-highlight b, .school-notification-simple b { display: block; margin-bottom: 5px; color: #47624e; font-size: 9px; font-weight: 700; letter-spacing: .04em; }
        .school-notification-highlight--red b { color: #c4262c; }
        .school-notification-highlight strong, .school-notification-simple strong { display: block; color: #20252b; font-size: 14px; font-weight: 500; }
        .school-notification-highlight p, .school-notification-simple p { margin: 6px 0 0; color: #62686d; font-size: 11px; line-height: 1.45; }
        .school-notification-highlight time, .school-notification-simple time { color: #62686d; font-size: 10px; white-space: nowrap; }
        .school-notification-simple { display: grid; grid-template-columns: 46px minmax(0, 1fr) auto; gap: 18px; align-items: start; width: 100%; padding: 15px 20px; border: 0; border-radius: 12px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
        .school-notification-simple .school-notification-icon { background: #eef0f1; }
        .school-notification-highlight.is-unread, .school-notification-simple.is-unread { box-shadow: inset 0 0 0 1px rgba(30, 167, 73, 0.18); background: #f7fbf8; }
        .admin-mobile-notification-header { display: flex; align-items: center; justify-content: space-between; min-height: 44px; margin: -4px 0 16px; }
        .admin-mobile-notification-header button { display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 50%; background: #fff; color: #20252b; box-shadow: 0 2px 8px rgba(23, 34, 56, .06); }
        .admin-mobile-notification-header h2 { margin: 0; color: #20252b; font-size: 18px; font-weight: 700; }
        .admin-mobile-notification-mark-read { width: auto !important; min-width: auto; padding: 0 10px !important; border-radius: 999px !important; background: #eafaf0 !important; color: #16843d !important; font-size: 10px !important; font-weight: 700; box-shadow: none !important; }
        .admin-mobile-notifications-content { display: flex; flex-direction: column; gap: 16px; }
        .admin-mobile-notification-group { display: flex; flex-direction: column; gap: 10px; }
        .admin-mobile-notification-group h3 { margin: 0 0 2px; color: #5f6f6a; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        .admin-mobile-notification-item { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 12px; width: 100%; padding: 14px 12px; border: 0; border-radius: 16px; background: #fff; color: inherit; text-align: left; box-shadow: 0 3px 10px rgba(23, 34, 56, .04); cursor: pointer; }
        .admin-mobile-notification-item.is-unread { border: 1px solid rgba(30, 167, 73, 0.18); background: #f7fbf8; }
        .admin-mobile-notification-item .school-notification-icon { width: 28px; height: 28px; }
        .admin-mobile-notification-item b { display: block; color: #47624e; font-size: 8px; font-weight: 700; letter-spacing: .04em; }
        .admin-mobile-notification-item strong { display: block; color: #20252b; font-size: 13px; font-weight: 600; }
        .admin-mobile-notification-item p { margin: 6px 0 0; color: #62686d; font-size: 11px; line-height: 1.35; }
        .admin-mobile-notification-item time { color: #62686d; font-size: 9px; white-space: nowrap; }
        .school-load-more { display: flex; align-items: center; justify-content: center; gap: 8px; width: fit-content; min-width: 126px; margin: 27px auto 0; padding: 10px 17px; border: 1px solid #dfe2e4; border-radius: 999px; background: #eef0f1; color: #20252b; font: inherit; font-size: 11px; font-weight: 600; line-height: 1; cursor: pointer; transition: background .2s ease, border-color .2s ease, box-shadow .2s ease; }
        .school-load-more:hover { border-color: #cbd1ce; background: #e3e7e5; box-shadow: 0 3px 10px rgba(23, 34, 56, .08); }
        .school-load-more svg { color: #526158; stroke-width: 2.5; }

        .admin-sidebar-inner { display: flex; flex-direction: column; min-height: calc(100vh - 40px); }
        .admin-sidebar-brand { display: flex; align-items: center; min-height: 44px; margin: 0 14px 42px; }
        .admin-sidebar-brand .brand-logo-image { width: 142px; }
        .admin-sidebar-nav { display: flex; flex-direction: column; gap: 7px; }
        .admin-sidebar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 13px;
          width: 100%;
          min-height: 44px;
          padding: 0 15px;
          border: 0;
          border-radius: 0 16px 16px 0;
          background: transparent;
          color: #252b3d;
          font: inherit;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: background .2s ease, color .2s ease;
        }
        .admin-sidebar-nav-item:hover { background: #f2f8f3; }
        .admin-sidebar-nav-item.is-active { background: #e1f4e7; color: #125f31; }
        .admin-sidebar-nav-item.is-active::before { position: absolute; top: 0; bottom: 0; left: 0; width: 3px; border-radius: 0 4px 4px 0; background: #16843d; content: ''; }
        .admin-sidebar-nav-item svg { flex: 0 0 auto; }
        .admin-sidebar-notification-dot { width: 7px; height: 7px; margin-left: auto; border-radius: 50%; background: #c92c31; }
        .admin-sidebar-help { margin-top: auto; padding: 17px 16px 15px; border-radius: 17px; background: #e4f7e9; }
        .admin-sidebar-help strong { display: block; margin-bottom: 10px; color: #14552d; font-size: 12px; font-weight: 600; }
        .admin-sidebar-help button { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; padding: 11px 8px; border: 0; border-radius: 999px; background: #22dd55; color: #07331b; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
        .admin-sidebar-logout { display: flex; align-items: center; gap: 10px; margin: 16px 12px 0; padding: 4px 0; border: 0; background: transparent; color: #65716a; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
        .admin-topbar-spacer { flex: 1; }
        .admin-topbar-search { display: flex; align-items: center; gap: 14px; width: 282px; height: 45px; margin-left: auto; padding: 0 16px; border-radius: 16px; background: #e3e5e6; color: #526158; }
        .admin-topbar-search input { width: 100%; border: 0; outline: 0; background: transparent; color: #27312d; font: inherit; font-size: 12px; }
        .admin-topbar-search input::placeholder { color: #7c858b; opacity: 1; }
        .admin-topbar-account { display: flex; align-items: center; gap: 13px; margin-left: 25px; }
        .admin-topbar-notifications { position: relative; display: grid; place-items: center; padding: 0; border: 0; background: transparent; color: #48544c; cursor: pointer; }
        .admin-topbar-notifications span { position: absolute; top: 0; right: -2px; width: 5px; height: 5px; border-radius: 50%; background: #c92c31; }
        .admin-topbar-divider { width: 1px; height: 28px; background: #d4d9d6; }
        .admin-topbar-user { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; white-space: nowrap; }
        .admin-topbar-user strong { color: #20252b; font-size: 13px; font-weight: 700; }
        .admin-topbar-user span { color: #707a75; font-size: 11px; }
        .admin-topbar-avatar { display: grid; place-items: center; width: 36px; height: 36px; overflow: hidden; padding: 0; border: 2px solid #16843d; border-radius: 50%; background: #dcefe2; color: #166534; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
        .admin-topbar-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .admin-mobile-notification-header { display: none; }
        @media (min-width: 769px) {
          .admin-desktop-sidebar { position: fixed; z-index: 30; top: 0; bottom: 0; left: 0; overflow-y: auto; }
          .admin-dashboard-main-wrapper { margin-left: 14rem; }
          .admin-desktop-header { position: fixed; z-index: 25; top: 0; right: 0; left: 14rem; min-height: 68px; }
          .admin-dashboard-main { padding-top: 92px; }
        }
        @media (min-width: 769px) {
          .school-desktop-notifications { display: block; }
          .admin-mobile-notifications-content { display: none; }
        }

        .admin-mobile-header,
        .admin-mobile-bottomnav { display: none; }

        @media (max-width: 768px) {
          .admin-dashboard-shell { background: #f4f5f7; padding-bottom: 78px; }
          .admin-dashboard-shell > .flex { min-height: 0; }
          .admin-snackbar { top: 82px; width: calc(100vw - 32px); gap: 12px; padding: 20px 16px; border-radius: 20px; }
          .admin-snackbar-icon { width: 48px; height: 48px; }
          .admin-snackbar > div { padding-top: 2px; }
          .admin-snackbar strong { font-size: 16px; }
          .admin-snackbar p { margin-top: 14px; font-size: 14px; }
          .school-overview-hero { grid-template-columns: 1fr; gap: 12px; }
          .school-job-form-title { font-size: 22px; }
          .school-job-form-subtitle { line-height: 1.45; }
          .school-job-basic-fields, .school-job-extra-fields { grid-template-columns: 1fr; }
          .school-job-form-card { padding: 17px 14px; }
          .school-job-form-actions { position: sticky; bottom: 78px; z-index: 2; margin: 0 -18px; padding: 12px 18px calc(12px + env(safe-area-inset-bottom)); background: rgba(244, 245, 247, .94); backdrop-filter: blur(10px); }
          .school-job-form-actions button { flex: 1; }
          .school-jobs-heading { margin-bottom: 24px; }
          .school-jobs-heading h2 { font-size: 25px; }
          .school-jobs-heading button { padding: 9px 13px; }
          .school-jobs-toolbar { display: block; margin-bottom: 16px; }
          .school-job-filters { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 10px; }
          .school-job-filters button { flex: 0 0 auto; padding: 8px 14px; }
          .school-jobs-toolbar-right { justify-content: space-between; padding-top: 8px; }
          .school-job-row { grid-template-columns: 42px minmax(0, 1fr); gap: 11px; min-height: 0; padding: 15px 13px; }
          .school-job-row-icon { width: 40px; height: 40px; }
          .school-job-row-icon svg { width: 18px; }
          .school-job-row-title { display: block; margin-bottom: 7px; }
          .school-job-row-title h3 { margin-bottom: 6px; font-size: 15px; }
          .school-job-row-meta { flex-wrap: wrap; gap: 7px 11px; font-size: 10px; }
          .school-job-row-actions { grid-column: 2; justify-content: flex-end; gap: 13px; margin-top: -2px; }
          .school-job-row-actions button { font-size: 11px; }
          .school-welcome-panel { padding: 22px 18px; }
          .school-welcome-panel h2 { font-size: 21px; }
          .school-profile-card { padding: 18px 16px; }
          .school-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 22px; }
          .school-stat-card { min-height: 92px; padding: 12px; }
          .school-stat-card > strong { margin-top: 35px; font-size: 26px; }
          .school-overview-section { border-radius: 16px; }
          .school-table-row { grid-template-columns: 1.25fr 1fr .7fr .55fr; padding: 0 11px; font-size: 8px; }
          .school-table-head { font-size: 7px; }
          .school-posting-grid { grid-template-columns: 1fr; }
          .admin-mobile-notification-header { display: flex; align-items: center; justify-content: space-between; min-height: 44px; margin: -4px 0 16px; }
          .admin-mobile-notification-header button { display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 50%; background: #fff; color: #20252b; box-shadow: 0 2px 8px rgba(23, 34, 56, .06); }
          .admin-mobile-notification-header h2 { margin: 0; color: #20252b; font-size: 18px; font-weight: 700; }
          .admin-mobile-notification-header span { width: 36px; height: 36px; }
          .admin-desktop-sidebar,
          .admin-desktop-header { display: none; }
          .admin-dashboard-main-wrapper { margin-left: 0; }
          .admin-mobile-header {
            display: flex;
            position: relative;
            align-items: center;
            justify-content: space-between;
            height: 68px;
            padding: 0 20px;
            background: #fff;
            border-bottom: 1px solid #e7ebe8;
          }
          .admin-mobile-header .brand-logo-image { width: 126px; }
          .admin-mobile-avatar {
            display: grid;
            place-items: center;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #dcf6e3;
            color: #166534;
            font-size: 11px;
            font-weight: 800;
          }
          .admin-mobile-bell {
            position: relative;
            display: grid;
            place-items: center;
            width: 34px;
            height: 34px;
            border: 0;
            background: transparent;
            color: #526158;
          }
          .admin-mobile-bell span {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #dc5b5b;
          }
          .admin-dashboard-main { padding: 24px 18px 20px; }
          .admin-dashboard-main > div { max-width: none; }
          .admin-dashboard-main h2 { line-height: 1.25; }
          .admin-dashboard-main .mb-6:first-child { margin-bottom: 22px; }
          .admin-dashboard-main .mb-6:first-child h2 { font-size: 23px; }
          .admin-dashboard-main .mb-6:first-child p { font-size: 13px; line-height: 1.5; }
          .admin-dashboard-main .mb-6:first-child button { width: 100%; justify-content: center; }
          .admin-dashboard-main .grid.md\\:grid-cols-2.xl\\:grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 14px;
          }
          .admin-dashboard-main .grid.md\\:grid-cols-2.xl\\:grid-cols-4 > div,
          .admin-dashboard-main .grid.md\\:grid-cols-3 > div {
            border-radius: 20px;
            padding: 16px;
          }
          .admin-dashboard-main .grid.md\\:grid-cols-2.xl\\:grid-cols-4 > div:nth-child(n+4) { display: none; }
          .admin-dashboard-main .grid.md\\:grid-cols-2.xl\\:grid-cols-4 > div > div:last-child { margin-top: 8px; font-size: 26px; }
          .admin-dashboard-main .grid.md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 20px; }
          .admin-dashboard-main .grid.md\\:grid-cols-3 > div { padding: 12px 10px; }
          .admin-dashboard-main .grid.md\\:grid-cols-3 svg { width: 18px; margin-bottom: 10px; }
          .admin-dashboard-main .grid.md\\:grid-cols-3 p:last-child { margin-top: 5px; font-size: 22px; }
          .admin-dashboard-main .rounded-2xl { border-radius: 22px; }
          .admin-dashboard-main .rounded-2xl.bg-white { padding: 18px; }
          .admin-dashboard-main .rounded-2xl.bg-white > h2 { font-size: 18px; }
          .admin-dashboard-main .rounded-xl { border-radius: 16px; }
          .admin-mobile-bottomnav {
            position: fixed;
            z-index: 20;
            right: 0;
            bottom: 0;
            left: 0;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            padding: 10px 8px calc(10px + env(safe-area-inset-bottom));
            background: rgba(255, 255, 255, .72);
            border: 1px solid rgba(255, 255, 255, .82);
            border-bottom: 0;
            border-radius: 24px 24px 0 0;
            box-shadow: 0 -8px 28px rgba(23, 34, 56, .08), inset 0 1px 0 rgba(255, 255, 255, .7);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
            backdrop-filter: blur(18px) saturate(140%);
          }
          .admin-mobile-bottomnav button {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            border: 0;
            background: transparent;
            color: #8a9890;
            font-size: 10px;
            font-weight: 700;
          }
          .admin-mobile-bottomnav button.is-active { color: #16843d; }
        }



      /* ============================================================
   APPLICANT SUMMARY PAGE
   Fully scoped to .school-applicant-summary-page
   ============================================================ */

.school-applicant-summary-page {
  width: 100%;
  min-height: 100%;
  background: transparent;
  color: #52605b;
  box-sizing: border-box;
}

.school-applicant-summary-page *,
.school-applicant-summary-page *::before,
.school-applicant-summary-page *::after {
  box-sizing: border-box;
}


/* ============================================================
   MAIN CONTAINER
   ============================================================ */

.school-applicant-summary-page .school-summary-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  background: #ffffff;
  overflow: hidden;
}

.school-applicant-summary-page .school-summary-content {
  width: 100%;
}


/* ============================================================
   BACK BUTTON
   ============================================================ */

.school-applicant-summary-page .school-summary-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  margin: 0 0 16px 0;
  padding: 9px 14px;

  border: 1px solid #d7dfdc;
  border-radius: 8px;

  background: #ffffff;
  color: #10233d;

  font-size: 14px;
  font-weight: 500;

  cursor: pointer;

  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.school-applicant-summary-page .school-summary-back-btn:hover {
  border-color: #006b4f;
  color: #006b4f;
  background: #f7faf9;
}


/* ============================================================
   GENERAL SECTIONS
   ============================================================ */

.school-applicant-summary-page .school-summary-section {
  padding: 36px 42px;

  border-bottom: 1px solid #dfe3e2;

  background: #ffffff;
}

.school-applicant-summary-page
.school-summary-section--first {
  padding-top: 34px;
  padding-bottom: 36px;
}


/* ============================================================
   PROFESSIONAL SUMMARY
   ============================================================ */

/*
   The action buttons float to the right.
   The heading and paragraph remain one continuous
   text/content area and the paragraph wraps around
   the button area.
*/

.school-applicant-summary-page
.school-summary-section--first
.school-summary-actions {
  float: right;

  width: 185px;

  margin-left: 45px;
  margin-bottom: 10px;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.school-applicant-summary-page
.school-summary-summary-content {
  width: 100%;
}


/* Professional Summary heading */

.school-applicant-summary-page
.school-summary-section--first
.school-summary-header-title {
  display: flex;
  align-items: center;
  gap: 13px;

  margin-bottom: 18px;
}

.school-applicant-summary-page
.school-summary-section--first
.school-summary-header-title h2 {
  margin: 0;

  color: #10233d;

  font-size: 23px;
  line-height: 1.25;
  font-weight: 650;
  letter-spacing: -0.3px;
}


/* Professional Summary icon */

.school-applicant-summary-page
.school-summary-section--first
.school-summary-icon {
  width: 24px;
  height: 24px;

  flex-shrink: 0;

  color: #006b4f;

  stroke-width: 2;
}


/* Professional Summary body */

.school-applicant-summary-page
.school-summary-section--first
.school-summary-text {
  width: auto;
  max-width: none;

  margin: 0;

  color: #56615d;

  font-size: 17px;
  line-height: 1.6;
  font-weight: 400;
}


/* Clear floated buttons */

.school-applicant-summary-page
.school-summary-clearfix {
  clear: both;
}


/* ============================================================
   ACTION BUTTONS
   ============================================================ */

.school-applicant-summary-page
.school-summary-shortlist-btn,
.school-applicant-summary-page
.school-summary-reject-btn {
  width: 100%;
  min-height: 44px;

  padding: 0 16px;

  border-radius: 9px;

  font-family: inherit;
  font-size: 15px;
  font-weight: 500;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.school-applicant-summary-page
.school-summary-shortlist-btn {
  border: 1px solid #006b4f;

  background: #006b4f;
  color: #ffffff;
}

.school-applicant-summary-page
.school-summary-shortlist-btn:hover {
  background: #00583f;
  border-color: #00583f;
}

.school-applicant-summary-page
.school-summary-shortlist-btn:active,
.school-applicant-summary-page
.school-summary-reject-btn:active {
  transform: translateY(1px);
}

.school-applicant-summary-page
.school-summary-reject-btn {
  border: 1px solid #df2525;

  background: #ffffff;
  color: #df2525;
}

.school-applicant-summary-page
.school-summary-reject-btn:hover {
  background: #fff7f7;
  border-color: #d51e1e;
}

.school-applicant-summary-page .school-summary-no-cover-letter {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 54px;
  padding: 0 14px;
  border: 1px dashed #d7dfdc;
  border-radius: 8px;
  background: #fafcfb;
  color: #748078;
  font-size: 12px;
  font-weight: 600;
}

.school-applicant-summary-page .school-summary-no-cover-letter svg {
  flex: 0 0 auto;
  color: #98a49e;
}

.school-applicant-summary-page .school-summary-cover-letter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #cfe1d8;
  border-radius: 8px;
  background: #f7fbf8;
  color: #146b49;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background .18s ease, border-color .18s ease, color .18s ease;
}

.school-applicant-summary-page .school-summary-cover-letter svg {
  width: 17px;
  height: 17px;
  color: #16833e;
}

.school-applicant-summary-page .school-summary-cover-letter:hover {
  border-color: #198344;
  background: #eaf6ee;
  color: #0d593a;
}

.school-applicant-summary-page .school-summary-cover-letter:focus-visible {
  outline: 3px solid rgba(25, 131, 68, .2);
  outline-offset: 2px;
}


/* ============================================================
   SECTION HEADERS
   ============================================================ */

.school-applicant-summary-page
.school-summary-section-header {
  display: flex;
  align-items: center;
  gap: 13px;

  margin-bottom: 20px;
}

.school-applicant-summary-page
.school-summary-section-header h2 {
  margin: 0;

  color: #10233d;

  font-size: 23px;
  line-height: 1.25;
  font-weight: 650;
  letter-spacing: -0.3px;
}

.school-applicant-summary-page
.school-summary-icon {
  width: 24px;
  height: 24px;

  flex-shrink: 0;

  color: #006b4f;

  stroke-width: 2;
}


/* ============================================================
   TEACHING SUBJECTS + QUALIFICATIONS
   ============================================================ */

.school-applicant-summary-page
.school-summary-grid-2col {
  display: grid;

  grid-template-columns: 1fr 1fr;

  width: 100%;

  border-bottom: 1px solid #dfe3e2;

  background: #ffffff;
}

.school-applicant-summary-page
.school-summary-grid-2col
> .school-summary-section {
  border-bottom: 0;
}

.school-applicant-summary-page
.school-summary-grid-2col
> .school-summary-section:first-child {
  border-right: 1px solid #dfe3e2;
}


/* ============================================================
   SUBJECT TAGS
   ============================================================ */

.school-applicant-summary-page
.school-summary-tags {
  display: flex;

  flex-wrap: wrap;

  gap: 6px;
}

.school-applicant-summary-page
.school-summary-tag {
  display: inline-flex;
  align-items: center;

  min-height: 28px;

  padding: 4px 13px;

  border-radius: 16px;

  background: #e5f2ed;

  color: #075f48;

  font-size: 13px;
  line-height: 1;
  font-weight: 650;
}


/* ============================================================
   QUALIFICATIONS
   ============================================================ */

.school-applicant-summary-page
.school-summary-qualifications {
  display: flex;

  flex-direction: column;

  gap: 12px;
}

.school-applicant-summary-page
.school-summary-qualification {
  display: grid;

  grid-template-columns: 1fr auto;

  align-items: center;

  gap: 25px;
}

.school-applicant-summary-page
.school-summary-qualification strong {
  color: #53605c;

  font-size: 16px;
  line-height: 1.4;
  font-weight: 450;
}

.school-applicant-summary-page
.school-summary-qual-year {
  color: #737b78;

  font-size: 13px;
  font-weight: 500;

  white-space: nowrap;
}

.school-applicant-summary-page
.school-summary-badge-wrapper {
  margin-top: 1px;
}

.school-applicant-summary-page
.school-summary-badge {
  display: inline-flex;
  align-items: center;

  min-height: 26px;

  padding: 0 13px;

  border-radius: 14px;

  background: #006b4f;

  color: #ffffff;

  font-size: 10px;
  line-height: 1;
  font-weight: 700;

  letter-spacing: 0.3px;
}


/* ============================================================
   TEACHING EXPERIENCE
   ============================================================ */

.school-applicant-summary-page
.school-summary-experience-timeline {
  position: relative;

  margin-top: 26px;

  padding-left: 35px;
}


/* Timeline vertical line */

.school-applicant-summary-page
.school-summary-experience-timeline::before {
  content: "";

  position: absolute;

  top: 6px;
  bottom: 8px;

  left: 7px;

  width: 2px;

  background: #e0e8e5;
}


/* Timeline item */

.school-applicant-summary-page
.school-summary-timeline-item {
  position: relative;

  display: flex;

  padding-bottom: 42px;
}

.school-applicant-summary-page
.school-summary-timeline-item:last-child {
  padding-bottom: 0;
}


/* Timeline bullet */

.school-applicant-summary-page
.school-summary-timeline-bullet {
  position: absolute;

  top: 2px;
  left: -35px;

  width: 18px;
  height: 18px;

  border: 2px solid #7d8884;

  border-radius: 50%;

  background: #ffffff;

  z-index: 2;
}

.school-applicant-summary-page
.school-summary-timeline-bullet--active {
  border-color: #006b4f;
}


/* ============================================================
   JOB INFORMATION
   ============================================================ */

.school-applicant-summary-page
.school-summary-job {
  width: 100%;
}

.school-applicant-summary-page
.school-summary-job-header {
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 25px;
}

.school-applicant-summary-page
.school-summary-job-header strong {
  display: block;

  color: #10233d;

  font-size: 20px;
  line-height: 1.25;
  font-weight: 650;

  letter-spacing: -0.2px;
}

.school-applicant-summary-page
.school-summary-job-school {
  margin: 7px 0 0;

  color: #006b4f;

  font-size: 16px;
  line-height: 1.3;
}

.school-applicant-summary-page
.school-summary-timeline-item:nth-child(2)
.school-summary-job-school {
  color: #68706d;
}

.school-applicant-summary-page
.school-summary-job-desc {
  max-width: 1100px;

  margin: 17px 0 0;

  color: #59635f;

  font-size: 15px;
  line-height: 1.5;
  font-weight: 400;
}


/* ============================================================
   EXPERIENCE DATE BADGES
   ============================================================ */

.school-applicant-summary-page
.school-summary-date {
  display: inline-flex;

  align-items: center;

  min-height: 29px;

  padding: 0 13px;

  border-radius: 5px;

  background: #e2e5e5;

  color: #495451;

  font-size: 13px;
  font-weight: 500;

  white-space: nowrap;

  flex-shrink: 0;
}

.school-applicant-summary-page
.school-summary-date--current {
  background: #dce8fb;

  color: #495b70;
}


/* ============================================================
   BOTTOM ROW
   ============================================================ */

.school-applicant-summary-page
.school-summary-bottom-row {
  display: grid;

  grid-template-columns:
    minmax(300px, 1fr)
    minmax(400px, 1fr);

  gap: 55px;

  padding: 12px 0 0;

  background: #ffffff;
}


/* ============================================================
   KEY SKILLS CARD
   ============================================================ */

.school-applicant-summary-page
.school-summary-section--skills {
  margin: 0 0 30px 0;

  padding: 25px 26px;

  border: 1px solid #e0e7e4;

  border-radius: 13px;

  background: #ffffff;

  box-shadow:
    0 3px 9px rgba(15, 35, 50, 0.05);
}

.school-applicant-summary-page
.school-summary-section--skills
.school-summary-section-header {
  margin-bottom: 16px;
}

.school-applicant-summary-page
.school-summary-section--skills
.school-summary-section-header h2 {
  font-size: 21px;
}


/* Skills */

.school-applicant-summary-page
.school-summary-skills {
  display: flex;

  flex-wrap: wrap;

  gap: 5px;
}

.school-applicant-summary-page
.school-summary-skill-tag {
  display: inline-flex;

  align-items: center;

  min-height: 35px;

  padding: 5px 13px;

  border: 1px solid #becac6;

  border-radius: 8px;

  background: #ffffff;

  color: #27394f;

  font-size: 14px;

  line-height: 1.2;
}


/* ============================================================
   DOCUMENTS
   ============================================================ */

.school-applicant-summary-page
.school-summary-documents {
  display: flex;

  flex-direction: column;

  justify-content: center;

  gap: 12px;

  padding: 0 42px 30px 0;
}


/* Document card */

.school-applicant-summary-page
.school-summary-document {
  display: flex;

  align-items: center;

  gap: 13px;

  min-height: 70px;

  padding: 11px 16px;

  border: 1px solid #e1e8e5;

  border-radius: 12px;

  background: #ffffff;

  box-shadow:
    0 3px 9px rgba(15, 35, 50, 0.05);
}


/* Document icon */

.school-applicant-summary-page
.school-summary-doc-icon-box {
  display: flex;

  align-items: center;

  justify-content: center;

  width: 39px;
  height: 39px;

  flex-shrink: 0;

  border-radius: 5px;
}

.school-applicant-summary-page
.school-summary-doc-icon-box--pdf {
  background: #ffe1dd;

  color: #e53935;
}

.school-applicant-summary-page
.school-summary-doc-icon-box--pdf span {
  font-size: 9px;

  line-height: 1;

  font-weight: 800;
}

.school-applicant-summary-page
.school-summary-doc-icon-box--doc {
  background: #dce7fb;

  color: #4c6180;
}


/* Document information */

.school-applicant-summary-page
.school-summary-doc-info {
  min-width: 0;

  flex: 1;
}

.school-applicant-summary-page
.school-summary-doc-name {
  overflow: hidden;

  margin: 0 0 3px;

  color: #25364c;

  font-size: 16px;

  line-height: 1.25;

  font-weight: 500;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.school-applicant-summary-page
.school-summary-doc-size {
  margin: 0;

  color: #8a9490;

  font-size: 11px;

  line-height: 1.3;
}


/* Document buttons */

.school-applicant-summary-page
.school-summary-doc-actions {
  display: flex;

  align-items: center;

  gap: 7px;

  flex-shrink: 0;
}

.school-applicant-summary-page
.school-summary-doc-btn {
  display: flex;

  align-items: center;

  justify-content: center;

  width: 26px;
  height: 26px;

  padding: 0;

  border: 0;

  background: transparent;

  color: #52605b;

  cursor: pointer;

  transition: color 0.2s ease;
}

.school-applicant-summary-page
.school-summary-doc-btn:hover {
  color: #006b4f;
}


/* ============================================================
   TABLET
   ============================================================ */

@media (max-width: 1100px) {

  .school-applicant-summary-page
  .school-summary-section {
    padding-left: 30px;
    padding-right: 30px;
  }

  .school-applicant-summary-page
  .school-summary-section--first {
    padding-top: 30px;
    padding-bottom: 32px;
  }

  .school-applicant-summary-page
  .school-summary-text {
    font-size: 16px;
  }

  .school-applicant-summary-page
  .school-summary-section-header h2 {
    font-size: 21px;
  }

  .school-applicant-summary-page
  .school-summary-actions {
    width: 175px;

    margin-left: 35px;
  }

  .school-applicant-summary-page
  .school-summary-bottom-row {
    grid-template-columns:
      minmax(260px, 1fr)
      minmax(320px, 1fr);

    gap: 30px;
  }

  .school-applicant-summary-page
  .school-summary-documents {
    padding-right: 30px;
  }

}


/* ============================================================
   TABLET / SMALL LAPTOP
   ============================================================ */

@media (max-width: 900px) {

  .school-applicant-summary-page
  .school-summary-section-header--with-actions {
    flex-direction: column;
  }

  .school-applicant-summary-page
  .school-summary-actions {
    width: 100%;
    max-width: 280px;
  }

  .school-applicant-summary-page
  .school-summary-bottom-row {
    grid-template-columns: 1fr;

    gap: 0;
  }

  .school-applicant-summary-page
  .school-summary-documents {
    padding:
      0
      30px
      30px;
  }

}


/* ============================================================
   MOBILE — 700px
   ============================================================ */

@media (max-width: 700px) {

  /* ----------------------------------------------------------
     Main sections
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-section {
    padding:
      28px
      22px;
  }

  .school-applicant-summary-page
  .school-summary-section--first {
    padding:
      28px
      22px
      30px;
  }


  /* ----------------------------------------------------------
     Professional Summary
     ---------------------------------------------------------- */

  /*
     Stop floating on mobile.
     Buttons become a normal block above the summary.
  */

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-actions {
    float: none;

    width: 100%;
    max-width: 300px;

    margin:
      0
      0
      25px
      0;

    gap: 10px;
  }

  .school-applicant-summary-page
  .school-summary-shortlist-btn,
  .school-applicant-summary-page
  .school-summary-reject-btn {
    min-height: 44px;

    font-size: 14px;
  }


  /* ----------------------------------------------------------
     Professional Summary title
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-header-title {
    gap: 10px;

    margin-bottom: 15px;
  }

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-header-title h2 {
    font-size: 20px;
  }

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-icon {
    width: 21px;
    height: 21px;
  }


  /* ----------------------------------------------------------
     Professional Summary text
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-text {
    font-size: 15px;

    line-height: 1.55;
  }


  /* ----------------------------------------------------------
     Subjects + Qualifications
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-grid-2col {
    grid-template-columns: 1fr;
  }

  .school-applicant-summary-page
  .school-summary-grid-2col
  > .school-summary-section:first-child {
    border-right: 0;

    border-bottom: 1px solid #dfe3e2;
  }


  /* ----------------------------------------------------------
     Section headings
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-section-header {
    gap: 10px;

    margin-bottom: 17px;
  }

  .school-applicant-summary-page
  .school-summary-section-header h2 {
    font-size: 20px;
  }

  .school-applicant-summary-page
  .school-summary-icon {
    width: 21px;
    height: 21px;
  }


  /* ----------------------------------------------------------
     Qualifications
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-qualification {
    grid-template-columns: 1fr;

    gap: 3px;
  }

  .school-applicant-summary-page
  .school-summary-qualification strong {
    font-size: 15px;
  }

  .school-applicant-summary-page
  .school-summary-qual-year {
    font-size: 12px;
  }


  /* ----------------------------------------------------------
     Teaching Experience
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-experience-timeline {
    margin-top: 22px;

    padding-left: 30px;
  }

  .school-applicant-summary-page
  .school-summary-experience-timeline::before {
    left: 6px;
  }

  .school-applicant-summary-page
  .school-summary-timeline-bullet {
    left: -30px;

    width: 17px;
    height: 17px;
  }

  .school-applicant-summary-page
  .school-summary-timeline-item {
    padding-bottom: 35px;
  }


  /* ----------------------------------------------------------
     Job
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-job-header {
    flex-direction: column;

    gap: 10px;
  }

  .school-applicant-summary-page
  .school-summary-job-header strong {
    font-size: 19px;
  }

  .school-applicant-summary-page
  .school-summary-job-school {
    font-size: 15px;
  }

  .school-applicant-summary-page
  .school-summary-job-desc {
    margin-top: 14px;

    font-size: 14px;

    line-height: 1.55;
  }

  .school-applicant-summary-page
  .school-summary-date {
    align-self: flex-start;

    min-height: 27px;

    padding: 0 11px;

    font-size: 12px;
  }


  /* ----------------------------------------------------------
     Bottom row
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-bottom-row {
    grid-template-columns: 1fr;

    gap: 0;

    padding-top: 0;
  }


  /* ----------------------------------------------------------
     Key Skills
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-section--skills {
    margin:
      20px
      20px
      20px;

    padding:
      22px
      18px;

    border-radius: 12px;
  }

  .school-applicant-summary-page
  .school-summary-section--skills
  .school-summary-section-header {
    margin-bottom: 15px;
  }

  .school-applicant-summary-page
  .school-summary-section--skills
  .school-summary-section-header h2 {
    font-size: 19px;
  }

  .school-applicant-summary-page
  .school-summary-skill-tag {
    min-height: 34px;

    padding:
      5px
      11px;

    font-size: 13px;
  }


  /* ----------------------------------------------------------
     Documents
     ---------------------------------------------------------- */

  .school-applicant-summary-page
  .school-summary-documents {
    width: 100%;

    padding:
      0
      20px
      25px;

    gap: 10px;
  }

  .school-applicant-summary-page
  .school-summary-document {
    min-height: 65px;

    padding:
      10px
      12px;

    gap: 10px;

    border-radius: 10px;
  }

  .school-applicant-summary-page
  .school-summary-doc-icon-box {
    width: 36px;
    height: 36px;
  }

  .school-applicant-summary-page
  .school-summary-doc-name {
    font-size: 14px;
  }

  .school-applicant-summary-page
  .school-summary-doc-size {
    font-size: 10px;
  }

  .school-applicant-summary-page
  .school-summary-doc-actions {
    gap: 3px;
  }

  .school-applicant-summary-page
  .school-summary-doc-btn {
    width: 24px;
    height: 24px;
  }

}


/* ============================================================
   SMALL MOBILE — 480px
   ============================================================ */

@media (max-width: 480px) {

  .school-applicant-summary-page
  .school-summary-section {
    padding:
      24px
      18px;
  }

  .school-applicant-summary-page
  .school-summary-section--first {
    padding:
      24px
      18px
      27px;
  }


  /* Professional Summary */

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-actions {
    max-width: none;

    margin-bottom: 22px;
  }

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-header-title {
    gap: 9px;
  }

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-header-title h2 {
    font-size: 19px;
  }

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-text {
    font-size: 14px;

    line-height: 1.6;
  }


  /* Section headers */

  .school-applicant-summary-page
  .school-summary-section-header h2 {
    font-size: 19px;
  }


  /* Subject tags */

  .school-applicant-summary-page
  .school-summary-tag {
    min-height: 27px;

    padding:
      4px
      11px;

    font-size: 12px;
  }


  /* Timeline */

  .school-applicant-summary-page
  .school-summary-experience-timeline {
    padding-left: 28px;
  }

  .school-applicant-summary-page
  .school-summary-experience-timeline::before {
    left: 5px;
  }

  .school-applicant-summary-page
  .school-summary-timeline-bullet {
    left: -28px;

    width: 16px;
    height: 16px;
  }

  .school-applicant-summary-page
  .school-summary-job-header strong {
    font-size: 18px;
  }

  .school-applicant-summary-page
  .school-summary-job-school {
    font-size: 14px;
  }

  .school-applicant-summary-page
  .school-summary-job-desc {
    font-size: 13px;
  }


  /* Skills */

  .school-applicant-summary-page
  .school-summary-section--skills {
    margin:
      18px
      18px
      18px;

    padding:
      20px
      15px;
  }

  .school-applicant-summary-page
  .school-summary-skill-tag {
    font-size: 12px;
  }


  /* Documents */

  .school-applicant-summary-page
  .school-summary-documents {
    padding:
      0
      18px
      20px;
  }

  .school-applicant-summary-page
  .school-summary-document {
    gap: 8px;

    padding:
      9px
      10px;
  }

  .school-applicant-summary-page
  .school-summary-doc-icon-box {
    width: 34px;
    height: 34px;
  }

  .school-applicant-summary-page
  .school-summary-doc-name {
    font-size: 13px;
  }

  .school-applicant-summary-page
  .school-summary-doc-size {
    font-size: 9px;
  }

}


/* ============================================================
   VERY SMALL PHONES — 360px
   ============================================================ */

@media (max-width: 360px) {

  .school-applicant-summary-page
  .school-summary-section {
    padding:
      22px
      15px;
  }

  .school-applicant-summary-page
  .school-summary-section--first {
    padding:
      22px
      15px
      25px;
  }

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-header-title h2 {
    font-size: 18px;
  }

  .school-applicant-summary-page
  .school-summary-section--first
  .school-summary-text {
    font-size: 13px;
  }

  .school-applicant-summary-page
  .school-summary-section-header h2 {
    font-size: 18px;
  }

  .school-applicant-summary-page
  .school-summary-document {
    min-height: 60px;
  }

  .school-applicant-summary-page
  .school-summary-doc-icon-box {
    width: 32px;
    height: 32px;
  }

  .school-applicant-summary-page
  .school-summary-doc-name {
    font-size: 12px;
  }

  .school-applicant-summary-page
  .school-summary-doc-size {
    font-size: 8px;
  }

}  
      `}</style>
    </div>
  );
}
