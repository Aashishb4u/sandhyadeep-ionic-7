import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ToastController} from '@ionic/angular';
import * as moment from 'moment';
import {tap, switchMap, map} from 'rxjs/operators';
import {SharedService} from './shared.service';
import {Router} from '@angular/router';
import {StorageService} from './storage.service';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import {appConstants} from '../../assets/constants/app-constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Init with null to filter out the first value in a guard!
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentAccessToken = null;
  authUrl = appConstants.baseAuthUrl;
  userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  baseURL: string = appConstants.baseURLAdminAPIs;
  header: any;
  private country : BehaviorSubject<any> = new BehaviorSubject<any>('');
  constructor(private storageService: StorageService, private router: Router,
              private sharedService: SharedService,
              private http: HttpClient, public toastController: ToastController) {
    this.loadToken();
  }

  loginWithOtp(phoneData: any): Observable<any> {
    return this.http.post(`${this.authUrl}loginWithOtp`, phoneData).pipe(map((res: any) => {
      return res;
    }));
  }

  // Sign in a user and store access and refres token
  verifyOtp(credentials: any): Observable<any> {
    return this.http.post(`${this.authUrl}verifyOtp`, credentials).pipe(
        tap((response: any) => {
          if (response.data && response.data.user) {
            this.storageService.storeValue(appConstants.USER_INFO, response!.data!.user);
            this.storageService.storeValue(appConstants.ACCESS_TOKEN_KEY, response!.data!.tokens.access.token);
            this.storageService.storeValue(appConstants.REFRESH_TOKEN_KEY, response!.data!.tokens.refresh.token);
          }
          this.isAuthenticated.next(true);
        })
    );
  }


  resendOtp(userId: string) {
    return this.http.post(`${this.authUrl}resendOtp`, {userId: userId}).pipe(map((res: any) => {
      return res;
    }));
  }

  // Load accessToken on startup
  loadToken() {
    const token = this.storageService.getStorageValue(appConstants.ACCESS_TOKEN_KEY);
    if (token) {
      this.currentAccessToken = token;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  async logout() {
    const token = await this.storageService.getStoredValue(appConstants.REFRESH_TOKEN_KEY);
    return this.http.post(`${this.authUrl}logout`, {refreshToken: token}).pipe(
        tap(_ => {
          this.isAuthenticated.next(false);
          this.storageService.removeStoredItem(appConstants.REFRESH_TOKEN_KEY);
          this.storageService.removeStoredItem(appConstants.ACCESS_TOKEN_KEY);
          this.storageService.removeStoredItem(appConstants.USER_INFO);
          this.storageService.removeStoredItem(appConstants.SELECTED_SERVICES);
          this.storageService.removeStoredItem(appConstants.SELECTED_PACKAGES);
        })
    ).subscribe(() => {
      this.isAuthenticated.next(false);
      this.storageService.removeStoredItem(appConstants.REFRESH_TOKEN_KEY);
      this.storageService.removeStoredItem(appConstants.ACCESS_TOKEN_KEY);
      this.storageService.removeStoredItem(appConstants.USER_INFO);
      this.storageService.removeStoredItem(appConstants.SELECTED_SERVICES);
      this.storageService.removeStoredItem(appConstants.SELECTED_PACKAGES);
      this.router.navigate(['/login']);
    });
  }

  // Load the refresh token from storage
  // then attach it as the header for one specific API call
  getNewAccessToken() {
    const refreshToken = from(this.storageService.getStoredValue(appConstants.REFRESH_TOKEN_KEY));
    return refreshToken.pipe(
        switchMap(token => {
          if (token) {
            const resBody = {
              refreshToken: token
            };
            return this.http.post(`${this.authUrl}refresh-tokens`, resBody);
          } else {
            // No stored refresh token
            return of(null);
          }
        })
    );
  }

  getBrands() {
    const localUrl = 'assets/json_files/brands.json';
    return this.http.get(localUrl);
  }

  getSkinTypes() {
    const localUrl = 'assets/json_files/skinTypes.json';
    return this.http.get(localUrl);
  }

  // Store a new access token
  storeAccessToken(accessToken: any) {
    this.currentAccessToken = accessToken;
    return from(this.storageService.storeValue(appConstants.ACCESS_TOKEN_KEY, accessToken));
  }

  updateUser(data: any, userId: string) {
    return this.http.patch(`${this.baseURL}users/${userId}`, data, {});
  }

  createUser(data: any) {
    return this.http.post(`${this.baseURL}users`, data, {});
  }

  getUserDetails(userId: string) {
    return this.http.get(`${this.baseURL}users/${userId}`, {});
  }

  getAllUserDetails() {
    return this.http.get(`${this.baseURL}users/all`, {});
  }

  getAllServiceTypes() {
    return this.http.get(`${this.baseURL}serviceTypes`, {});
  }

  getAllServices() {
    return this.http.get(`${this.baseURL}services`, {});
  }

  deleteServiceType(serviceTypeId: any) {
    return this.http.delete(`${this.baseURL}serviceTypes/${serviceTypeId}`, {});
  }

  createServiceType(data: any) {
    return this.http.post(`${this.baseURL}serviceTypes`, data, {});
  }

  updateServiceType(data: any, id: any) {
    return this.http.patch(`${this.baseURL}serviceTypes/${id}`, data, {});
  }

  createSubService(data: any) {
    return this.http.post(`${this.baseURL}subServices`, data, {});
  }

  updateSubService(data: any, id: any) {
    return this.http.patch(`${this.baseURL}subServices/${id}`, data, {});
  }

  getAllSubService() {
    return this.http.get(`${this.baseURL}subServices`, {});
  }

  deleteSubService(id: any) {
    return this.http.delete(`${this.baseURL}subServices/${id}`, {});
  }

  createService(data: any) {
    return this.http.post(`${this.baseURL}services`, data, {});
  }

  updateService(data: any, id: any) {
    return this.http.patch(`${this.baseURL}services/${id}`, data, {});
  }

  deleteService(id: any) {
    return this.http.delete(`${this.baseURL}services/${id}`, {});
  }

  createPackage(data: any) {
    return this.http.post(`${this.baseURL}packages`, data, {});
  }

  updatePackage(data: any, id: any) {
    return this.http.patch(`${this.baseURL}packages/${id}`, data, {});
  }

  deletePackage(id: any) {
    return this.http.delete(`${this.baseURL}packages/${id}`, {});
  }

  getAllPackages() {
    return this.http.get(`${this.baseURL}packages`, {});
  }

  deleteUser(id: any) {
    return this.http.delete(`${this.baseURL}users/${id}`, {});
  }

  getAllRoles() {
    return this.http.get(`${this.baseURL}roles`, {});
  }

  deleteAppImage(id: any) {
    return this.http.delete(`${this.baseURL}appImages/${id}`, {});
  }

  createAppImage(data: any) {
    return this.http.post(`${this.baseURL}appImages`, data, {});
  }

  updateAppImage(data: any, id: any) {
    return this.http.patch(`${this.baseURL}appImages/${id}`, data, {});
  }

  getAllAppImages() {
    return this.http.get(`${this.baseURL}appImages`, {});
  }

  getAllBannerImages() {
    return this.http.get(`${this.baseURL}appImages?assetLocation=banner`, {});
  }

  getAllPortfolioImages() {
    return this.http.get(`${this.baseURL}appImages?assetLocation=portfolio`, {});
  }

  makeOnlinePayment(data: any) {
    return this.http.post(`${this.baseURL}payments/online`, data, {});
  }

  makeOfflinePayment(data: any) {
    return this.http.post(`${this.baseURL}payments/payOnService`, data, {});
  }

  updatePayment(data: any, id: any) {
    return this.http.patch(`${this.baseURL}payments/${id}`, data, {});
  }

  verifyPayment(data: any, id: any) {
    return this.http.post(`${this.baseURL}payments/verify/${id}`, data, {});
  }

  getAllBookings() {
    return this.http.get(`${this.baseURL}bookings`, {});
  }

  getUserBookings(id: any) {
    return this.http.get(`${this.baseURL}bookings/user/${id}`, {});
  }

  updateBooking(data: any, id: any) {
    return this.http.patch(`${this.baseURL}bookings/${id}`, data, {});
  }

  createBooking(data: any) {
    return this.http.post(`${this.baseURL}bookings`, data, {});
  }

  createCoupon(data: any) {
    return this.http.post(`${this.baseURL}coupons`, data, {});
  }

  getAllCoupon() {
    return this.http.get(`${this.baseURL}coupons`, {});
  }

  getApplicableCoupons(ids: any) {
    return this.http.post(`${this.baseURL}coupons/selectedServices`, ids, {});
  }

  updateCoupon(data: any, id: any) {
    return this.http.patch(`${this.baseURL}coupons/${id}`, data, {});
  }

  deleteCoupon(id: any) {
    return this.http.delete(`${this.baseURL}coupons/${id}`, {});
  }

  applyCoupons(data: any) {
    return this.http.post(`${this.baseURL}coupons/apply-coupon`, data,  {});
  }
  //
  // // -------------------------  JSON APIS ------------------------------
  //
  // getBrands() {
  //   const localUrl = 'assets/json_files/brands.json';
  //   return this.http.get(localUrl);
  // }
  //
  // getSkinTypes() {
  //   const localUrl = 'assets/json_files/skinTypes.json';
  //   return this.http.get(localUrl);
  // }
  //
  // getUserRole() {
  //   return localStorage.getItem('role');
  // }
  //
  // setHeaderToken() {
  //   const token = localStorage.getItem('token');
  //   this.header = new HttpHeaders({Authorization: `Bearer ${token}`});
  // }
  //
  // getServicesData() {
  //   const localUrl = 'assets/json_files/services.json';
  //   return this.http.get(localUrl);
  // }
  //
  // getMainServiceData() {
  //   const localUrl = 'assets/json_files/MainServices.json';
  //   return this.http.get(localUrl);
  // }
  //
  // getCombos() {
  //   const localUrl = 'assets/json_files/packages.json';
  //   return this.http.get(localUrl);
  // }
  //
  // getCoupons() {
  //   const localUrl = 'assets/json_files/coupons.json';
  //   return this.http.get(localUrl);
  // }
  //
  // getServicePackage() {
  //   const localUrl = 'assets/json_files/service-packages.json';
  //   return this.http.get(localUrl);
  // }
  //
  // getProducts() {
  //   const localUrl = 'assets/json_files/products.json';
  //   return this.http.get(localUrl);
  // }
  //
  // getBookings() {
  //   const localUrl = 'assets/json_files/bookings.json';
  //   return this.http.get(localUrl);
  // }

  commonError(err: any) {
    const errCode = err.status;
    let errorMessage = err.error.message;
    switch (errCode) {
      case 401: {
        this.sharedService.removeAllUserDetails();
        this.router.navigate(['login']);
        break;
      }
      case 0: {
        errorMessage = 'No Internet Connection';
        break;
      }
    }
    this.presentToast(errorMessage).then();
  }

  async presentToast(displayMessage: any) {
    const toast = await this.toastController.create({
      message: displayMessage,
      position: 'top',
      cssClass: 'ionic-error-toast',
      duration: 2000,
    });
    toast.present();
  }

  private setSession(authResult: any) {
    if (authResult.data.id) {
      this.sharedService.setUserId(authResult.data.id);
    }
  }

  private setToken(authResult: any) {
    if (authResult.data.token) {
      this.sharedService.setToken(authResult.data.token);
    }
  }
  //
  // logout() {
  //   localStorage.removeItem("id_token");
  //   localStorage.removeItem("expires_at");
  // }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration: any = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }


}
