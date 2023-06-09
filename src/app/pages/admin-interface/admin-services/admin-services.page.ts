import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AlertController, IonicModule, ModalController} from '@ionic/angular';
import {appConstants} from "../../../../assets/constants/app-constants";
import {SharedService} from "../../../shared-services/shared.service";
import {CommunicationService} from "../../../shared-services/admin-services/communication.service";
import {ApiService} from "../../../shared-services/api.service";
import {AdminServiceModalPage} from "../../../shared-components/modals/admin-service-modal/admin-service-modal.page";
import {MatDividerModule} from "@angular/material/divider";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-admin-services',
  templateUrl: './admin-services.page.html',
  styleUrls: ['./admin-services.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, MatDividerModule, MatButtonModule]
})
export class AdminServicesPage implements OnInit {

  // tslint:disable-next-line:max-line-length
  constructor(private sharedService: SharedService,
              private alertController: AlertController,
              private communicationService: CommunicationService,
              private adminService: ApiService, public modalController: ModalController) { }
  services: any = [];
  selectedServiceEdit: any = null;
  selectedService: any = null;
  async presentModal(componentData) {
    const modal = await this.modalController.create({
      component: AdminServiceModalPage,
      cssClass: 'admin-modal-class',
      backdropDismiss: true,
      showBackdrop: true,
      breakpoints: [0, 0.8, 1],
      initialBreakpoint: 0.8,
      componentProps: componentData
    });
    modal.onWillDismiss().then(() => {
      this.getAllServices();
    });
    return await modal.present();
  }

  onEdit(serviceType) {
    this.selectedServiceEdit = serviceType;
    this.presentModal(serviceType);
  }

  ionViewWillLeave() {
    this.closeModal();
  }

  async closeModal() {
    const onClosedData: string = 'Wrapped Up!';
    await this.modalController.dismiss(onClosedData);
  }

  async onDelete(serviceType) {
    this.communicationService.showAdminSpinner.next(true);
    const serviceTypeId = serviceType.id;
    const alert = await this.alertController.create({
      header: `Do you want to delete ${serviceType.name}?`,
      cssClass: 'alert-popup',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.communicationService.showAdminSpinner.next(false);
          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.deleteService(serviceTypeId);
          },
        },
      ]
    });

    await alert.present();
  }

  deleteService(serviceTypeId) {
    this.adminService.deleteService(serviceTypeId).subscribe(
        res => this.deleteServiceSuccess(res),
        error => {
          this.adminService.commonError(error);
        }
    );
  }

  deleteServiceSuccess(res) {
    this.sharedService.presentToast('service deleted Successfully.', 'success');
    this.getAllServices();
    this.communicationService.showAdminSpinner.next(false);
  }

  ionViewWillEnter() {
    this.communicationService.pageTitle.next('Services');
    this.getAllServices();
  }

  ngOnInit() {}

  getAllServices() {
    this.adminService.getAllServices().subscribe(
        res => this.getAllServicesSuccess(res),
        error => {
          this.adminService.commonError(error);
        }
    );
  }

  getAllServicesSuccess(res) {
    this.services = res;
    if (this.services && this.services.length) {
      this.services = this.services.map((ser) => {
        // Adding the api url and also updating image with timestamp
        ser.brands = ser.brands.map((val) => {
          val = val.split('_').join(' ');
          return val;
        });
        ser.skinTypes = ser.skinTypes.map((val) => {
          val = val.split('_').join(' ');
          return val;
        });
        ser.imageUrl = `${appConstants.domainUrlApi}${ser.imageUrl}?${new Date().getTime()}`;
        return ser;
      });
    }
  }


}
