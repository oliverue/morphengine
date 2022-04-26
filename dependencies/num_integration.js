// This file has been modified for use in MorphEngine by Oliver Unter Ecker and is used with permission.
// The original header information has been retained.

////////////////////////////////////////////////////////////////////////////
//
//                       Copyright (c) 2007-2009
//                       Future Team Aps 
//                       Denmark
//
//                       All Rights Reserved
//
//   This source file is subject to the terms and conditions of the
//   Future Team Software License Agreement which restricts the manner
//   in which it may be used.
//   Mail: hve@hvks.com
//
/////////////////////////////////////////////////////////////////////////////
//
// Module name     :    integrationbase.js
// Module ID Nbr   :   
// Description     :   Javascript integration base class
// --------------------------------------------------------------------------
// Change Record   :   
//
// Version  Author/Date     Description of changes
// -------  --------------- ----------------------
//  01.01   HVE/2007-Apr-16 Initial release
//  02.03   HVE/2007-May-19 Added Gauss-Legendre and Gauss-Chebyshev
//  02.04   HVE/2007-May-25 Added Gauss-Hermit
//  02.05   HVE/2007-Jun-13 Corrected a bug in calculation of q
//  02.06   HE/Nov-15-2009  Added Double Exponetial integration method
// End of Change Record
//
/////////////////////////////////////////////////////////////////////////////

// New Integration Object
// Class Constructor. 
Integration = function (func)
    {
	this.func=func;
    this.cnt=0;         // Statistics
    this.i=new Array;   // Iterations
    this.q=new Array; // Convergence power  
    this.convergence=new Function("","with(Math) {if(this.i.length>2){var x=this.i[this.i.length-1]-this.i[this.i.length-2]; var y=this.i[this.i.length-2]-this.i[this.i.length-3];if(x==0) this.q[this.q.length]=0; else this.q[this.q.length]=abs((LOG2E*log(abs(x/y)))).toFixed(2);}}");
    }
    
// Class Prototypes
Integration.prototype.valueof=function() { return this.func; }
Integration.prototype.value=function(x) //Evaluate f(x). 
    {var f;
    try{f=eval(this.func(Number(x)));}
    catch(e){alert(e);return Number.NaN;}
    this.cnt++; return Number(f);
    }
Integration.prototype.iteration=function(s) {this.i[this.i.length]=s; this.convergence();}  
Integration.prototype.reset=function() {this.i.length=0; this.q.length=0; this.cnt=0;}


// Integration Gauss Legendre Quadrature
Integration.prototype.gausslegendre=function(a,b)
    {
    this.gaussQuadDist=new Array;
    this.gaussQuadWeight=new Array;
    // Returns the distance (gaussQuadDist) and weight coefficients (gaussQuadCoeff) for an n point Gauss-Legendre Quadrature.
    // The Gauss-Legendre distances, gaussQuadDist, are scaled to -1 to 1
    function gaussQuadCoeff(o,n)
        {
        var z, z1, pp, p1, p2, p3, eps=Math.pow(2,-54)*10*n, x1=-1.0, x2=1.0;
        // Calculate roots. Roots are symmetrical - only half calculated
        var m=(n+1)/2, xm=0.5*(x2+x1), xl=0.5*(x2-x1);
        // Loop for  each root
        for(var i=1; i<=m; i++)
            {var it=0; z=Math.cos(Math.PI*(i-0.25)/(n+0.5));    // Approximation of ith root
            do{// Refinement on above using Newton's method
                p1=1.0; p2=0.0; it++;
                // Legendre polynomial (p1, evaluated at z, p2 is polynomial of one order lower) recurrence relationsip
                for(var j=1; j<=n; j++){p3=p2; p2=p1; p1=((2*j-1)*z*p2-(j-1)*p3)/j;}
                pp=n*(z*p1-p2)/(z*z-1);    // Derivative of p1
                z1=z; z=z1-p1/pp;            // Newton's method
            }while(Math.abs(z-z1)>eps&&it<6);
           if(it>=6) alert("Insuficient accuracy for Gauss Weight and Coefficients. Needed "+eps+" got "+Math.abs(z-z1));
            o.gaussQuadDist[i-1]=xm-xl*z;           // Scale root to desired interval
            o.gaussQuadDist[n-i]=xm+xl*z;           // Symmetric counterpart
            o.gaussQuadWeight[i-1]=2*xl/((1-z*z)*pp*pp);    // Compute weight
            o.gaussQuadWeight[n-i]=o.gaussQuadWeight[i-1];      // Symmetric counterpart
            }
        }
    
    // Numerical integration using n point Gaussian-Legendre quadrature (instance method)
    function gaussLegendre(o,a,b,n)
        {var sum=0.0, xplus=0.5*(Number(b)+Number(a)), xminus=0.5*(b-a);
      gaussQuadCoeff(o,n);// Calculate Gauss-Legendre coefficients, i.e. the weights and scaled distances
      for(var i=0; i<n; i++){var dx=xminus*o.gaussQuadDist[i]+xplus; sum+=o.gaussQuadWeight[i]*o.value(dx);}
      sum*=xminus; return sum;
        }

    var s, s0, dx0, dx, eps;
    if(a==b)return 0;   if(arguments.length==3) return gaussLegendre(this,a,b,arguments[2]); 
    eps=Math.pow(2,-54)*10; this.reset();//    this.method("Gauss-Legendre");// Fixed n
    for(var i=1,s0=0,dx0=Number.POSITIVE_INFINITY;i<=2048;dx0=dx,s0=s,i*=2)
        {
        s=gaussLegendre(this,a,b,i);
        dx=Math.abs(s-s0);  this.iteration(s); if(dx==0) break;
        if(this.i.length>2){if(dx<eps*(i*2+1)*s&&this.q.length>1&&this.q[this.q.length-2]*0.85>this.q[this.q.length-1]) break;}
        }
    this.accuracy=Math.abs(2*dx).toExponential(0);      
    return s;
   }
   
// Integration Double Exponential
Integration.prototype.doubleexponential=function(a,b)
    {
    function DoubleExponential(o,a,b,n)
        {n/=2; var h=5.0/n; var ss=0.0;
        for(var k=-n;k<=n;k++)
            {var z=h*k; var exz=Math.exp(z); var hcos=exz+1.0/exz; var hsin=exz-1.0/exz; var s=Math.exp(Math.PI*hsin); var w=s+1.0/s; var x=(b*s+a/s)/w;
            if(x!=a&&x!=b) {var dxdz=2*(b-a)*Math.PI*hcos/(w*w); ss+=h*o.value(x)*dxdz; }
            //if(n==1) alert("x="+x);
            }
        //alert("["+a+";"+b+"]:"+n+"="+ss);
        return ss; 
        }

    var s, s0, dx0, dx, i, eps;
    if(a==b)return 0;   if(arguments.length==3) return DoubleExponential(this,a,b,arguments[2]); 
    eps=Math.pow(2,-54); this.reset();//  this.method("DoubleExponential"); // Fixed n 
    for(i=1,s0=0,dx0=Number.POSITIVE_INFINITY;i<=32768;dx0=dx,s0=s,i*=2)
        {s=DoubleExponential(this,a,b,i); 
        dx=Math.abs(s-s0);  this.iteration(s);  if(dx==0&&i!=1) break; 
        if(this.i.length>2){if(dx<eps*(i+1)*s&&this.q.length>1&&this.q[this.q.length-2]*0.85>this.q[this.q.length-1]) break;}
        }
    this.accuracy=Math.abs(2*dx).toExponential(0);      
    return s;
    }   
