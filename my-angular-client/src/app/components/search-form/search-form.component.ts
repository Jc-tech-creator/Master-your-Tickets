import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { autocomplete } from '../../autocomplete';
import { tap, finalize, switchMap, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css'],
})
export class SearchFormComponent implements OnInit {
  searchFormData: FormGroup;
  isLoading = false;
  filteredAttra: autocomplete[] = [];
  myControl = new FormControl('', Validators.required);
  searchRes: any;
  @Output() resultForSearch = new EventEmitter<any>();
  @Output() clearDetailTable = new EventEmitter<any>();
  @Output() clearTable = new EventEmitter<any>();

  constructor(private apiservice: ApiService) {
    this.searchFormData = new FormGroup({
      inputKeyword: this.myControl,
      inputDistance: new FormControl(10),
      inputCategory: new FormControl('Default'),
      inputLocation: new FormControl('', Validators.required),
      gridCheck: new FormControl(false),
    });
  }

  ngOnInit() {
    // reference from given tutorial and stackOverflow
    this.myControl.valueChanges
      .pipe(
        debounceTime(280),
        tap(() => (this.isLoading = true)),
        switchMap((res) =>
          this.apiservice
            .fetchAutocomplete(res ?? '')
            .pipe(finalize(() => (this.isLoading = false)))
        )
      )
      .subscribe((attractions) => (this.filteredAttra = attractions));
  }

  clear() {
    const gridCheckEle = this.searchFormData.get('gridCheck');
    const inputLocationEle = this.searchFormData.get('inputLocation');
    if (gridCheckEle?.value) {
      inputLocationEle?.enable();
    }
    this.searchFormData.reset({
      inputKeyword: '',
      inputDistance: 10,
      inputCategory: 'Default',
      inputLocation: '',
      gridCheck: false,
    });
    this.searchRes = null;
    this.resultForSearch.emit(this.searchRes);
    this.clearTable.emit({ value: false, timestamp: new Date().getTime() });
    this.clearDetailTable.emit('clear');
  }
  checkAuto() {
    const gridCheckEle = this.searchFormData.get('gridCheck');
    const inputLocationEle = this.searchFormData.get('inputLocation');

    if (gridCheckEle?.value) {
      inputLocationEle?.setValue('');
      inputLocationEle?.disable();
    } else {
      inputLocationEle?.enable();
    }
  }
  // add clear() function here, based on above elements
  onSubmit() {
    if (this.searchFormData.invalid) {
      console.log('miss');
      return;
    }
    console.log('call onSubmit');
    if (this.searchFormData.value.inputKeyword.name) {
      this.searchFormData.value.inputKeyword =
        this.searchFormData.value.inputKeyword.name;
    }
    const formData = this.searchFormData.value;
    console.log('formData:', formData);
    this.apiservice.searchEvent(formData).subscribe({
      next: (response) => {
        console.log('API response:', response);
        // console.log(response._embedded.events);
        if (response._embedded) {
          this.searchRes = response._embedded.events;
        } else {
          this.searchRes = 'empty';
        }
        this.resultForSearch.emit(this.searchRes);
        this.clearTable.emit({ value: false, timestamp: new Date().getTime() });
        this.clearDetailTable.emit('clear');
      },
      error: (error) => {
        this.searchRes = 'empty';
        this.resultForSearch.emit(this.searchRes);
        this.clearTable.emit({ value: false, timestamp: new Date().getTime() });
        this.clearDetailTable.emit('clear');
        console.error('API error:', error);
      },
    });
  }

  SelectFn(auto: autocomplete): string {
    if (auto) {
      return auto.name;
    } else {
      console.log('this is an error');
      return ''; // Return an empty string instead of undefined
    }
  }
}
