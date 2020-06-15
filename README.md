# Fiive Auth Web App (Aplicación de Autenticación)
![Fiive](https://fiivestudio.com/wp-content/uploads/2020/06/Fiive-Open-Source_2.png)

Esta solución funciona como un servidor de autenticación basado en token con OAuth2.0 y Owin, permitiendo configurar aplicaciones clientes que podrán tener el acceso para autenticarse  a través de una llave, y a su vez, obtener el token para poder acceder a los datos. 

Esta solución hace parte del proyecto **[Sports Play]([https://fiivestudio.com/2020/06/09/conoce-sports-play/](https://fiivestudio.com/2020/06/09/conoce-sports-play/))** y corresponde a la primera aplicacion de las tres que componentes el proyecto. 

## Comenzando 🚀

A continuación describimos brevemente los pasos para colocar en funcionamiento el proyecto. 

### Pre-requisitos 📋

 - Framework 4.5.2 o superior. 
 - EntityFramework 	6.0
 - SQL server 2017.
 - Fiive.Framework *(se encuentra en la carpeta **Fiive.Framework**)*
   
### Instalación 🔧

 1. Crear una base de datos en su *SQL Server* con el nombre **sportsplay**.
 2. Ejecute el Script de la base de datos *(se encuentra en la carpeta **Base.Datos**)*
 3. Descargar el proyecto del repositorio.
 4. Abrir el proyecto con el IDE de Visual Studio. 
 5. Agregar la referencia ***Fiive.Framework.dll***.
 6. Actualizar la cadena de conexión de la base de datos en el archivo **Web.config**.

```
 <connectionStrings>
    <add name="SportsPlayDataContext" connectionString="data source=[SERVIDOR];initial catalog=sportsplay;persist security info=True;user id=[USER_DATABASE];password=[PASSWORD_DATABASE];MultipleActiveResultSets=True;App=EntityFramework" providerName="System.Data.SqlClient" />
  </connectionStrings>
```


## Construido con 🛠️

* [ASP.NET _Web API](https://dotnet.microsoft.com/apps/aspnet/apis) - Framework
* [Json](https://www.nuget.org/packages/Newtonsoft.Json/) - Formato para intercambio de datos.
* [Owin](http://owin.org/) - Interfaz entre aplicaciones web .NET y servidores web.
* [OAuth 2.0](https://oauth.net/2/) - Protocolo de autorización.

## Autores ✒️

* **[Alejandra Morales](https://fiivestudio.com/alejandra-morales)**
* **[Pablo Díaz](https://fiivestudio.com/pablo-diaz)**

## Notas Adicionales

* Tenga en cuenta que este proyecto es uno de los tres requeridos para que toda la solución de **[Sports Play]([https://fiivestudio.com/2020/06/09/conoce-sports-play/](https://fiivestudio.com/2020/06/09/conoce-sports-play/))** funcione correctamente. 
* Actualmente nos encontramos creando el Wiki detallado de la solución. 
