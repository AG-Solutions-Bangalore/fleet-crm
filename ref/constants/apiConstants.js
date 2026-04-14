export const LOGIN = {
  postLogin: "/panel-login",
};
export const PANEL_CHECK = {
  getPanelStatus: "/panel-check-status",
  getEnvStatus: "/panel-fetch-dotenv",
};

///new
export const DASHBOARD_API = {
  list: "/dashboard",
  create: "/service",
  byId: (id) => `/service/${id}`,
  updateById: (id) => `/service/${id}?_method=PUT`,
  updateStatus: (id) => `/services/${id}/status`,
};

export const SERVICE_API = {
  list: "/service",
  create: "/service",
  byId: (id) => `/service/${id}`,
  updateById: (id) => `/service/${id}?_method=PUT`,
  updateStatus: (id) => `/services/${id}/status`,
  delete: (id) => `/service-sub/${id}`,
};

export const NOTIFICATION_API = {
  list: "/notification",
  byId: (id) => `/notification/${id}`,
  updateById: (id) => `/notification/${id}?_method=PUT`,
  updateStatus: (id) => `/notifications/${id}/status`,
};

export const CLIENT_API = {
  list: "/member",
  byId: (id) => `/member/${id}`,
  updateById: (id) => `/member/${id}`,
  report: "/client-report",
  updateStatus: (id) => `/members/${id}/status`,
};

export const REQUEST_API = {
  list: "/service-request",
  byId: (id) => `/service-request/${id}`,
  updateById: (id) => `/service-request/${id}`,
  updateStatus: (id) => `/service-requests/${id}/status`,
  report: "/service-request-report",
};

export const COMPLAINT_API = {
  list: "/complaint",
  byId: (id) => `/complaint/${id}`,
  updateById: (id) => `/complaint/${id}`,
  updateStatus: (id) => `/complaints/${id}/status`,
};

export const ACTIVE_SERVICE_API = {
  list: "activeServices",
};


// old

export const SIDE_POPUP_API = {
  list: "/side-popup",
  byId: (id) => `/side-popup/${id}`,
  updateById: (id) => `/side-popup/${id}`,
};
export const POPUP_API = {
  list: "/popup",
  byId: (id) => `/popup/${id}`,
  updateById: (id) => `/popup/${id}?_method=PUT`,
};
export const PR_API = {
  list: "/pr",
  byId: (id) => `/pr/${id}`,
  updateById: (id) => `/pr/${id}?_method=PUT`,
};
export const BANNER_API = {
  list: "/banner",
  create: "/banner",
  byId: (id) => `/banner/${id}`,
  updateById: (id) => `/banner/${id}?_method=PUT`,
};

export const COMPANY_API = {
  list: "/company",
  create: "/company",
  dropdown: "/companys",
  byId: (id) => `/company/${id}`,
  updateById: (id) => `/company/${id}?_method=PUT`,
};
export const FAQ_API = {
  list: "/faq",
  create: "/faq",
  byId: (id) => `/faq/${id}`,
  updateById: (id) => `/faq/${id}`,
  deleteFaq: (id) => `/faqSub/${id}`,
  updateStatus: (id) => `/faqtopStatus/${id}`,
};
export const BLOG_API = {
  list: "/blog",
  create: "/blog",
  dropdown: "/blogs",
  byId: (id) => `/blog/${id}`,
  delete: (id) => `/blog/${id}`,
  deleteSub: (id) => `/blog-sub/${id}`,
  deleteRelated: (id) => `/blog-related/${id}`,
  updateById: (id) => `/blog/${id}?_method=PUT`,
};
export const GALLERY_API = {
  list: "/link-gallery",
  create: "/link-gallery",
  dropdown: "/link-gallerys",
  byId: (id) => `/link-gallery/${id}`,
  delete: (id) => `/link-gallery/${id}`,
  updateById: (id) => `/link-gallery/${id}?_method=PUT`,
};
export const PAGE_TWO_API = {
  dropdown: "/page-two",
};
export const CHANGE_PASSWORD_API = {
  create: "/panel-change-password",
};
export const COUNTRY_API = {
  list: "/country",
  dropdown: "/countrys",
  byId: (id) => `/country/${id}`,
};
export const LETUREYOUTUBE_API = {
  list: "/lecture-youtube",
  byId: (id) => `/lecture-youtube/${id}`,
  updateById: (id) => `/lecture-youtube/${id}?_method=POST`,
  updateById: (id) => `/lecture-youtube/${id}?_method=PUT`,
};
export const LETUREYOUTUBEPLAYLIST_API = {
  list: "/lecture-youtube-playlist",
  byId: (id) => `/lecture-youtube-playlist/${id}`,
  activelist: "/lecture-youtube-playlists",
};

export const COURSE_API = {
  courses: "/courses",
};
export const GALLERYAPI = {
  gallery: "/link-gallery",
  byId: (id) => `/link-gallery/${id}`,
  updateById: (id) => `/link-gallery/${id}?_method=PUT`,
};
export const YOUTUBEFOR_API = {
  list: "/youtubeFor",
};
export const NEWSLETTER_API = {
  list: "/newsletter",
};
export const STUDENT_API = {
  list: "/student",
  byId: (id) => `/student/${id}`,
  updateById: (id) => `/student/${id}?_method=PUT`,
};
// 427*240
