import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Sanitizer } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { GoogleMap, MapCircle } from '@angular/google-maps'
import { Observable } from 'rxjs';
import { Ci_vettore } from './models/ci_vett.model';
import { GeoFeatureCollection } from './models/geojson.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  title = 'server mappe';
  //Variabile che conterrà i nostri oggetti GeoJson
  geoJsonObject: GeoFeatureCollection;
  //Observable per richiedere al server python i dati sul DB
  obsGeoData: Observable<GeoFeatureCollection>;
  // Centriamo la mappa
  center: google.maps.LatLngLiteral = { lat: 45.506738, lng: 9.190766 };
  zoom: 8;

  markerList: google.maps.MarkerOptions[];
  obsCiVett: Observable<Ci_vettore[]>;
  circleCenter: google.maps.LatLng;
  circleOptions: google.maps.CircleOptions;



  constructor(public http: HttpClient, public changeDetector : ChangeDetectorRef) {
    //Facciamo iniettare il modulo HttpClient dal framework Angular (ricordati di importare la libreria)
  }

  //Metodo che scarica i dati nella variabile geoJsonObject
  prepareData = (data: GeoFeatureCollection) => {
    this.geoJsonObject = data
    console.log(this.geoJsonObject);
  }

  prepareCiVettData = (data: Ci_vettore[]) => {
    console.log(data); //Verifica di ricevere i vettori energetici
    this.markerList = []; //NB: markers va dichiarata tra le proprietà markers : Marker[]
    for (const iterator of data) { //Per ogni oggetto del vettore creo un Marker
      let m: google.maps.MarkerOptions =
      {
        position: new google.maps.LatLng(iterator.WGS84_X, iterator.WGS84_Y),
        icon: this.findImage(iterator.CI_VETTORE)
      }
      //Marker(iterator.WGS84_X,iterator.WGS84_Y,iterator.CI_VETTORE);
      this.markerList.push(m);
    }
    this.center = this.LatLngMedia(data);
  }

  LatLngMedia(data: Ci_vettore[]): google.maps.LatLngLiteral {
    let latTot = 0; //Uso queste due variabili per calcolare latitudine e longitudine media
    let lngTot = 0; //E centrare la mappa
    for (const iterator of data) {
      latTot += iterator.WGS84_X; //Sommo tutte le latitutidini e longitudini
      lngTot += iterator.WGS84_Y;
    }

    return { lat: latTot / data.length, lng: lngTot / data.length };
  }

  findImage(label: string): google.maps.Icon {
    if (label.includes("Gas")) {
      return { url: './assets/img/gas.ico', scaledSize: new google.maps.Size(32, 32) };
    }
    if (label.includes("elettrica")) {
      return { url: './assets/img/electricity.ico', scaledSize: new google.maps.Size(32, 32) };
    }
    //Se non viene riconosciuta nessuna etichetta ritorna l'icona undefined
    return { url: './assets/img/undefined.ico', scaledSize: new google.maps.Size(32, 32) }
  }


  //Una volta che la pagina web è caricata, viene lanciato il metodo ngOnInit scarico i    dati 
  //dal server
  ngOnInit() {
    this.circleOptions = { fillColor: 'red', clickable: true, editable: true, radius: 200, visible : false }
  }

  /*this.obsGeoData = this.http.get<GeoFeatureCollection>("https://5000-fuchsia-reindeer-psolbb4g.ws-eu18.gitpod.io/ci_vettore/50");
   this.obsGeoData.subscribe(this.prepareData);*/



  cambiaFoglio(foglio: HTMLInputElement): boolean {
    let val = foglio.value; //Commenta qui
    this.obsCiVett = this.http.get<Ci_vettore[]>(`https://5000-fuchsia-reindeer-psolbb4g.ws-eu17.gitpod.io/ci_vettore/${val}`);  //Commenta qui
    this.obsCiVett.subscribe(this.prepareCiVettData); //Commenta qui
    console.log(val);
    this.circleRef.circle?.setVisible(false);
    return false;
  }

  //Aggiungi il gestore del metodo mapClicked
  mapClicked($event: google.maps.MapMouseEvent) {
    let coords = $event.latLng; //Queste sono le coordinate cliccate
    this.center = { lat: coords.lat(), lng: coords.lng() };
    this.circleRef.circle?.setVisible(true);
  }

  @ViewChild(MapCircle) circleRef: MapCircle;
  circleRightClicked($event: google.maps.MapMouseEvent) {
    this.circleRef.circle?.setVisible(false);

    let raggioInGradi = (this.circleRef.getRadius() * 0.00001)/1.1132;
    let lat = this.circleRef.getCenter().lat();
    let lng = this.circleRef.getCenter().lng();

    //Posso riusare lo stesso observable e lo stesso metodo di gestione del metodo    
    //cambiaFoglio poichè riceverò lo stesso tipo di dati
    this.obsCiVett = this.http.get<Ci_vettore[]>(`https://5000-fuchsia-reindeer-psolbb4g.ws-eu17.gitpod.io/ci_geovettore/${lat}/${lng}/${raggioInGradi}`);
    this.obsCiVett.subscribe(this.prepareCiVettData);
  }

  @ViewChild('mapRef') mapRef: GoogleMap;
  ngAfterViewInit() {
    this.mapRef.data.addGeoJson(this.geoJsonObject);
    this.mapRef.data.setStyle(this.styleFunc);
  }

  styleFunc = (feature: any) => {
    console.log(feature.i.id)
    let newColor = "#FF0000"; //RED
    if (feature.i.id == 0) newColor = "#00FF00"; //GREEN
    else newColor = "#0000FF"; //BLUE
    return ({
      clickable: false,
      fillColor: newColor,
      strokeWeight: 1
    });
  }



}
