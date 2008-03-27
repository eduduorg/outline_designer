/*--------------------------------------------------------------------
                  The PHP License, version 3.0
Copyright (c) 1999 - 2004 The PHP Group. All rights reserved.
--------------------------------------------------------------------

Redistribution and use in source and binary forms, with or without
modification, is permitted provided that the following conditions
are met:

  1. Redistributions of source code must retain the above copyright
     notice, this list of conditions and the following disclaimer.
 
  2. Redistributions in binary form must reproduce the above copyright
     notice, this list of conditions and the following disclaimer in
     the documentation and/or other materials provided with the
     distribution.
 
  3. The name "PHP" must not be used to endorse or promote products
     derived from this software without prior written permission. For
     written permission, please contact group@php.net.
 
  4. Products derived from this software may not be called "PHP", nor
     may "PHP" appear in their name, without prior written permission
     from group@php.net.  You may indicate that your software works in
     conjunction with PHP by saying "Foo for PHP" instead of calling
     it "PHP Foo" or "phpfoo"
 
  5. The PHP Group may publish revised and/or new versions of the
     license from time to time. Each version will be given a
     distinguishing version number.
     Once covered code has been published under a particular version
     of the license, you may always continue to use it under the terms
     of that version. You may also choose to use such covered code
     under the terms of any subsequent version of the license
     published by the PHP Group. No one other than the PHP Group has
     the right to modify the terms applicable to covered code created
     under this License.

  6. Redistributions of any form whatsoever must retain the following
     acknowledgment:
     "This product includes PHP, freely available from
     <http://www.php.net/>".

THIS SOFTWARE IS PROVIDED BY THE PHP DEVELOPMENT TEAM ``AS IS'' AND
ANY EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE PHP
DEVELOPMENT TEAM OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE.

--------------------------------------------------------------------

This software consists of voluntary contributions made by many
individuals on behalf of the PHP Group.

The PHP Group can be contacted via Email at group@php.net.

For more information on the PHP Group and the PHP project,
please see <http://www.php.net>.

This product includes the Zend Engine, freely available at
<http://www.zend.com>.*/
function JPSpan_Encode_PHP() {
    this.Serialize = new JPSpan_Serialize(this);
};

JPSpan_Encode_PHP.prototype = {

    // Used by rawpost request objects
    contentType: 'text/plain; charset=US-ASCII',
    
    encode: function(data) {
        return this.Serialize.serialize(data);
    },
    
    encodeInteger: function(v) {
        return 'i:'+v+';';
    },
    
    encodeDouble: function(v) {
        return 'd:'+v+';';
    },
    
    encodeString: function(v) {
        var s = ''
        for(var n=0; n<v.length; n++) {
            var c=v.charCodeAt(n);
            // Ignore everything but ASCII
            if (c<128) {
                s += String.fromCharCode(c);
            }
        }
        return 's:'+s.length+':"'+s+'";';
    },
    
    encodeNull: function() {
        return 'N;';
    },
    
    encodeTrue: function() {
        return 'b:1;';
    },
    
    encodeFalse: function() {
        return 'b:0;';
    },
    
    encodeArray: function(v, Serializer) {
        var indexed = new Array();
        var count = v.length;
        var s = '';
        for (var i=0; i<v.length; i++) {
            indexed[i] = true;
            s += 'i:'+i+';'+Serializer.serialize(v[i]);
        };

        for ( var prop in v ) {
            if ( indexed[prop] ) {
                continue;
            };
            s += Serializer.serialize(prop)+Serializer.serialize(v[prop]);
            count++;
        };
        
        s = 'a:'+count+':{'+s;
        s += '}';
        return s;
    },
    
    encodeObject: function(v, Serializer, cname) {
        var s='';
        var count=0;
        for (var prop in v) {
            s += 's:'+prop.length+':"'+prop+'";';
            if (v[prop]!=null) {
                s += Serializer.serialize(v[prop]);
            } else {
                s +='N;';
            };
            count++;
        };
        s = 'O:'+cname.length+':"'+cname.toLowerCase()+'":'+count+':{'+s+'}';   
        return s;
    },
    
    encodeError: function(v, Serializer, cname) {
        var e = new Object();
        if ( !v.name ) {
            e.name = cname;
            e.message = v.description;
        } else {
            e.name = v.name;
            e.message = v.message;
        };
        return this.encodeObject(e,Serializer,cname);
    }
}// $Id$
// Notes:
// - Watch out for recursive references - call inside a try/catch block if uncertain
// - Objects are serialized to PHP class name JPSpan_Object by default
// - Errors are serialized to PHP class name JPSpan_Error by default
//
// See discussion below for notes on Javascript reflection
// http://www.webreference.com/dhtml/column68/
function JPSpan_Serialize(Encoder) {
    this.Encoder = Encoder;
    this.typeMap = new Object();
};

JPSpan_Serialize.prototype = {

    typeMap: null,
    
    addType: function(cname, callback) {
        this.typeMap[cname] = callback;
    },
    
    serialize: function(v) {
    
        switch(typeof v) {
            //-------------------------------------------------------------------
            case 'object':
            
                // It's a null value
                if ( v === null ) {
                    return this.Encoder.encodeNull();
                }
                
                // Get the constructor
                var c = v.constructor;
                
                if (c != null ) {
                
                    // It's an array
                    if ( c == Array ) {
                        return this.Encoder.encodeArray(v,this);
                    } else {
                    
                        // Get the class name
                        var match = c.toString().match( /\s*function (.*)\(/ );

                        if ( match == null ) {
                            return this.Encoder.encodeObject(v,this,'JPSpan_Object');
                        }
                        

                        // Strip space for IE
                        var cname = match[1].replace(/\s/,'');
                        
                        // Has the user registers a callback for serializing this class?
                        if ( this.typeMap[cname] ) {
                            return this.typeMap[cname](v, this, cname);
                            
                        } else {
                            // Check for error objects
                            var match = cname.match(/Error/);
                        
                            if ( match == null ) {
                                return this.Encoder.encodeObject(v,this,'JPSpan_Object');
                            } else {
                                return this.Encoder.encodeError(v,this,'JPSpan_Error');
                            }

                        }
                    }
                } else {
                    // Return null if constructor is null
                    return this.Encoder.encodeNull();
                }
            break;
            
            //-------------------------------------------------------------------
            case 'string':
                return this.Encoder.encodeString(v);
            break;
            
            //-------------------------------------------------------------------
            case 'number':
                if (Math.round(v) == v) {
                    return this.Encoder.encodeInteger(v);
                } else {
                    return this.Encoder.encodeDouble(v);
                };
            break;
            
            //-------------------------------------------------------------------
            case 'boolean':
                if (v == true) {
                    return this.Encoder.encodeTrue();
                } else {
                    return this.Encoder.encodeFalse();
                };
            break;
            
            //-------------------------------------------------------------------
            default:
                return this.Encoder.encodeNull();
            break;
        }
    }
}

// $Id$
function JPSpan_Util_Data() {
    this.Serialize = new JPSpan_Serialize(this);
    this.indent = '';
};

JPSpan_Util_Data.prototype = {
    dump: function(data) {
        return this.Serialize.serialize(data);
    },
    
    encodeInteger: function(v) {
        return 'Integer: '+v+"\n";
    },
    
    encodeDouble: function(v) {
        return 'Double: '+v+"\n";
    },
    
    encodeString: function(v) {
        return "String("+v.length+"): "+v+"\n";
    },
    
    encodeNull: function() {
        return "Null\n";
    },
    
    encodeTrue: function() {
        return "Boolean(true)\n"
    },
    
    encodeFalse: function() {
        return "Boolean(false)\n"
    },
    
    encodeArray: function(v, Serializer) {
        var a=v;
        var indexed = new Array();
        var out="Array("+a.length+")\n";
        this.indent += "  ";
        if ( a.length>0 ) {
            for (var i=0; i < a.length; i++) {
                indexed[i] = true;
                out+=this.indent+"["+i+"]";
                if ( (a[i]+'') == 'undefined') {
                    out+= " = undefined\n";
                    continue;
                };
                out+= " = "+Serializer.serialize(a[i])+"\n";
            };
        };
        var assoc='';
        for ( var prop in a ) {
            if ( indexed[prop] ) {
                continue;
            };
            assoc+=this.indent+"[\""+prop+"\"]";
            if ( (a[prop]+'') == 'undefined') {
                assoc+= " = undefined\n";
                continue;
            };
            assoc+= " = "+Serializer.serialize(a[prop])+"\n";
        };
        if ( assoc.length > 0 ) {
            out += assoc;
        };
        this.indent = this.indent.substr(0,this.indent.length-2);
        return out;
    },
    
    encodeObject: function(v, Serializer, cname) {
        var o=v;
        if (o==null) return "Null\n";
        var out="Object("+cname+")\n";
        this.indent += "  ";
        for (var prop in o) {
            out+=this.indent+"."+prop+" = ";
            if (o[prop]==null) {
                out+="null\n";
                continue;
            };
            out+=Serializer.serialize(o[prop])+"\n";
        };
        this.indent = this.indent.substr(0,this.indent.length-2);
        return out;
    },
    
    encodeError: function(v, Serializer, cname) {
        var e = new Object();
        if ( !v.name ) {
            e.name = cname;
            e.message = v.description;
        } else {
            e.name = v.name;
            e.message = v.message;
        };
        return this.encodeObject(e,Serializer,cname);
    }
};


function var_dump(data) {
    var Data = new JPSpan_Util_Data();
    return Data.dump(data);
}

function serialize(data) {
    var Encoder = new JPSpan_Encode_PHP();
    return Encoder.encode(data);
}