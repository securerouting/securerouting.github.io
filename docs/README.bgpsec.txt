
  1. BGPSEC tar ball
  2. Installation Instructions:
  3. BIRD run time configuration
  4. Getting RPKI-RTR data (ROA's and Router Keys)
  5. License(s)


1. BGPSEC

This code adds BGPSEC capability to the BIRD BGP implementation.

This has only been tested on Linux machines. It is in an Alpha release
and ***should not be considered for production systems***.  The basic
BGPSEC protocol is supported with a several notable exceptions: more
than one signature block (for algorithm rollover), confederations, and
bugs we have not seen yet.

For information on BGPSEC see the Internet Engineering Task Force
(IETF) Secure Inter-Domain Routing (SIDR) working group page and
specifically the draft describing the BGPSEC protocol:

https://datatracker.ietf.org/wg/sidr/
https://datatracker.ietf.org/doc/draft-ietf-sidr-bgpsec-protocol/

This code is based on the v1.5.0 of the BIRD software.  Information
about BIRD including download instructions can be found at:

http://bird.network.cz/


2. Installation Instructions:

General Instructions 

Building BGPSEC enabled bird

This describes building bird with BGPSEC support turned on, which
requires a few steps.  Contents

    2.1 Dependencies
        2.1.1 Use An OpenSSL version that supports ECDSA (Elliptic
              Curve Digital Signature Algorithm)
    2.2 Building Bird
        2.2.1 Configuring and Compiling
    2.3 Testing
    2.4 Using It
    2.5 Coding For It


2.1 Dependencies

On Fedora, you'll want flex, bison, and readline-devel packages.

2.1.1 Use an OpenSSL version that supports ECDSA (Elliptic Curve
      Digital Signature Algorithm)

The default OpenSSL distributed on some Linux vendors does not include
elliptic curve support.  If yours distribution does not support
elliptic curve in the OpenSSL libraries, you'll need to grab a fresh
copy and compile it by hand. You may want to install it in a location
separate from the normally installed package. Use the --prefix option
to do this:

 # ./config --prefix=/usr/local/openssl-ecdsa

Then make and make install


2.2 Building Bird

Configuring and Compiling

Extract the tar ball.
 # tar xvjpf bird-1.5.0.-bgpsec-0.7.tar.bz2
 # cd bird-1.5.0-bgpsec-0.7/

Build it.
BIRD uses autoconf for local configuration.

 # autoconf 

Then Use configure flags that look like the following.  if a version
of OpenSSL that supported ecdsa had to be installed in a non-standard
location on your platform, it will be necessary to add something like
'-I/path/to//openssl-ecdsa/include' and '-L/path/to/openssl-ecdsa/lib'
options to the configure command.

 # ./configure '--enable-bgpsec' 

Then make and you should be good to go.


2.3 Using It

You can create key pairs using the proto/bgp/bgpsec/keytool.py
script.  For Example:

# proto/bgp/bgpsec/keytool.py --printski --public-key-dir /usr/share/bird/bgpsec-keys --private-key-dir /usr/share/bird/bgpsec-private-keys generate 'ASN'
 40C70252FE48D29401E9156ADBECF3EF42296AE4

Where ASN is the AS number for the key you are generating.

The generated public key is stored in '--public-key-dir' (default
/usr/share/bird/bgpsec-keys) and the private key is stored in
'--private-key-dir' (default /usr/share/bird/bgpsec-private-keys).
The file names are based on the AS number and the SKI value associated
with the keys, 'ASN.SKI#', e.g. for an ASN of 12345,
12345.40C70252FE48D29401E9156ADBECF3EF42296AE4.

The directory location used for public/private keys should be created
before running keytool.py.  The user running keytool.py must have
write permissions to these directories.  The user BIRD runs under will
need read permissions for all the key directory and files. For
security reasons, the private key directories/files should not be
publicly readable.  The BIRD configuration file also requires
configuration to indicate which directories to use for public and
private keys.

The public key can be copied to other machines and placed in the same
public key directory without the private key. Likewise, keys from
other routers can be placed into the public key directory with their
ASN/SKI identifying the file names in order for the validation
routines to look them up.

NOTE: in the future, the rpki-rtr protocol could be used instead to
pull router keys.  For example, BGPSEC-BIRD-Client is a tool that can
pull router keys from a rpki cache using the rpki-rtr protocol.


2.4 Coding For It

The API for use in validating stuff can be found in
proto/bgp/bgpsec/validate.h. But most importantly, these two functions
will be of the most use:

 int bgpsec_sign_data_with_ski(...);
 int bgpsec_verify_signature_with_ski(...);

As they sign and verify data simply by passing the data along with a
SKI in ascii/hex form and a ASN integer (in reality, it's just the
filename from above so as long as it can be stored in a file name it's
usable).

The algorithm option should be set to
BGPSEC_ALGORITHM_SHA256_ECDSA_P_256 or BGPSEC_DEFAULT_CURVE.


3. BIRD run time configuration

The BGPSEC implementation currently has several additional
configuration options for the configuration file.  The following is an
example bgp section from a BIRD configuration file supporting BGPSEC:

  protocol bgp {
  	 # BGPsec configuration
	 
	 # AS4 is required for BGPSEC, this must be enabled
         enable as4;

	 # enable bgpsec for this connection
	 # This also enables the capabilities required for BGPsec:
	 # RFC 4893 AS4, 4-byte ASs.
	 # RFC 4760 MP_REACH_NLRI, the multi-protocol extension.
         bgpsec on;

	 # bgpsec_origination_prefix sets the route prefixes that this
	 # router will originate with bgpsec.  One configuration line
	 # per prefix.
	 bgpsec_origination_prefix 10.1.1.0/24;
	 bgpsec_origination_prefix 10.1.2.0/24;

	 # The local BIRD router subject key identifier (SKI) for this
         # connection.  'bgpsec_ski' identifies the (private) key that
         # the local BIRD router should use to sign BGPSEC packets on
         # this connection.
         bgpsec_ski "8CA56CF0A4D943ACCEB9CB67967561CA8A773B73" ;

	 # The local directory paths for the public router key and private
         # key storage. The defaults are below:

         bgpsec_key_repo_path "/usr/share/bird/bgpsec-keys/" ;
	 bgpsec_priv_key_path "/usr/share/bird/bgpsec-private-keys" ;

	 # bgpsec_peer_pcount0 indicates whether a peer is allowed to
         # set its pcount to 0. Set this value to true/1 if you want
         # to allow your peer to not have their AS included in the
         # effective AS_PATH of a route (e.g. Route Servers).  Default
         # is false.
	 bgpsec_peer_pcount0 0;

	 # bgpsec_local_pcount0 indicates whether to set the local
         # pcount to 0 when signing routes.  Set this value to true/1
         # if you want to not have your AS included in the effective
         # AS_Path at peers. Default is false.
	 # Note: yours peers will have to be configured to allow this
         # or the updates will not be accepted.
	 bgpsec_local_pcount0 0;

	 # bgpsec_prefer indicates whether validly signed bgpsec
         # routes are preferred to non-valid and/or non-signed
         # routes. This decision is made after the local pref and
         # before the as_path comparison in the best route selection
         # algorithm. Default is true.
	 bgpsec_prefer 1;

	 # bgpsec_require indicates whether bgpsec signed routes are
         # required on this connection.  If true, Non-signed routes
         # will not be accepted.  Default is false.
	 bgpsec_require 0;

         # bgpsec_no_invalid_routes indicates if invalid routes are
         # accepted.  If true, routes that fail the BGPsec validity
         # check are not accepted.  Default is false.
	 bgpsec_no_invalid_routes 0;


	 # Non BGPsec configuration
	 
         description "BGP Link";
         local as 64521;

         neighbor 172.16.1.2 as 64522;
         gateway direct;
         
         path metric 1;         # prefer shorter paths
         default bgp_med 0;     # when none is available

         password "demonet";
  }


4. Getting RPKI-RTR data (ROA's and Router Keys)

BGPSEC-BIRD-client is a separate application that is provided in order
to pull data from a rpki-rtr using rtrLib.  It can garner Router
Origin Authorizations (ROAs) from a rpki-rtr and populate BIRD's ROA
tables in order to filter for Origin Authentication.  It can get
router public keys and place them in the local file system for use by
the BGPsec code.  Please see the README with that software for
instructions on how to use it.


5. License(s)

This BGPSEC code created by Parsons, Inc.

(c) 2013-2016 Parsons, Inc.
All Rights Reserved

The BGPsec code by Parsons is dual copyrighted under both the GPLv2+
and the BSD license.  It can be used under either license below:


GPLv2+

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or (at
your option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307
USA


BSD

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
 
*  Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
 
*  Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
 
*  Neither the name of Parsons, Inc nor the names of its contributors may
   be used to endorse or promote products derived from this software
   without specific prior written permission.
 
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS ``AS
IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
