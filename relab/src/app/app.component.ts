import { ElementRef } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'server mappe';
  //Aggiungiamo latitudine e longitudine di un luogo
  center: google.maps.LatLngLiteral;
  position: google.maps.LatLngLiteral;
  label: string;
  circleOptions: google.maps.CircleOptions;
  markerOptions: google.maps.MarkerOptions;
  vertices: google.maps.LatLngLiteral[];
  constructor() {
    this.center = { lat: 45.506738, lng: 9.190766 };
    this.position = this.center;
    this.label = "ciao";
    this.circleOptions = { fillColor: 'red' }
    let iconData: google.maps.Icon = {
      url: './assets/img/cat_acrobat.ico',
      scaledSize: new google.maps.Size(60, 60)
    }

    this.vertices = [
      {  lat: this.center.lat + 0.001, lng: this.center.lng - 0.002 },
      {  lat: this.center.lat, lng: this.center.lng },
      {  lat: this.center.lat - 0.001, lng: this.center.lng - 0.002}
    ];

    this.markerOptions = { icon: iconData }
  }

  @ViewChild('mapRef') mapRef: GoogleMap;
  ngAfterViewInit() {
    console.log(this.mapRef.data.loadGeoJson("https://storage.googleapis.com/mapsdevsite/json/google.json"));
  }

}
