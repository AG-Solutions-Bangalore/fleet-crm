import apiClient from "./apiClient";


//-------------------System & Status------------------------//
export const CHECK_STATUS_API = `/panel-check-status`;
export const FETCH_DOTENV_API = `/panel-fetch-dotenv`;

//-------------------Authentication------------------------//
export const PANEL_LOGIN_API = `/panel-login`;
export const FORGOT_PASSWORD_API = `/panel-send-password`;
export const CHANGE_PASSWORD_API = `/panel-change-password`;

//-------------------Pages------------------------//
export const PAGE_ONE_API = `/page-one`;
export const PAGE_TWO_API = `/page-two`;

//-------------------Company------------------------//
export const COMPANY_LIST_API = `/company`;
export const COMPANY_BY_ID_API = (id) => `/company/${id}`;
export const COMPANYS_API = `/companys`;

//-------------------Popup------------------------//
export const POPUP_LIST_API = `/popup`;
export const POPUP_BY_ID_API = (id) => `/popup/${id}`;

//-------------------Banner------------------------//
export const BANNER_LIST_API = `/banner`;
export const BANNER_BY_ID_API = (id) => `/banner/${id}`;

//-------------------FAQ------------------------//
export const FAQ_LIST_API = `/faq`;

const api = {
  system: {
    checkStatus: () => apiClient.get(CHECK_STATUS_API),
    fetchDotenv: () => apiClient.get(FETCH_DOTENV_API),
  },
  
  auth: {
    login: (data) => apiClient.post(PANEL_LOGIN_API, data),
    forgotPassword: (data) => apiClient.post(FORGOT_PASSWORD_API, data),
    changePassword: (data) => apiClient.post(CHANGE_PASSWORD_API, data),
  },
  
  pages: {
    fetchPageOne: () => apiClient.get(PAGE_ONE_API),
    fetchPageTwo: () => apiClient.get(PAGE_TWO_API),
  },
  
  company: {
    list: () => apiClient.get(COMPANY_LIST_API),
    create: (data) => apiClient.post(COMPANY_LIST_API, data),
    getById: (id) => apiClient.get(COMPANY_BY_ID_API(id)),
    update: (id, data) => apiClient.put(COMPANY_BY_ID_API(id), data),
    fetchCompanys: () => apiClient.get(COMPANYS_API),
  },
  
  popup: {
    list: () => apiClient.get(POPUP_LIST_API),
    getById: (id) => apiClient.get(POPUP_BY_ID_API(id)),
    update: (id, data) => apiClient.put(POPUP_BY_ID_API(id), data),
  },
  
  banner: {
    list: () => apiClient.get(BANNER_LIST_API),
    create: (data) => apiClient.post(BANNER_LIST_API, data),
    getById: (id) => apiClient.get(BANNER_BY_ID_API(id)),
    update: (id, data) => apiClient.put(BANNER_BY_ID_API(id), data),
  },
  
  faq: {
    list: () => apiClient.get(FAQ_LIST_API),
  }
};

export default api;