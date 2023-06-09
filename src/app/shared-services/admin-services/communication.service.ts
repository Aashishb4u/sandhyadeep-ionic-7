import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  showAdminSpinner = new BehaviorSubject<any>(false);
  pageTitle = new BehaviorSubject<any>('');
  constructor() { }
}
