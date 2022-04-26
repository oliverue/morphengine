var _dbg_withtrace        = false;
var _dbg_string            = new String();

function __dbg_print( text )
{
    _dbg_string += text + "\n";
}

function __lex( info )
{
    var state        = 0;
    var match        = -1;
    var match_pos    = 0;
    var start        = 0;
    var pos            = info.offset + 1;
	
    do
    {
        pos--;
        state = 0;
        match = -2;
        start = pos;
		
        if( info.src.length <= start )
            return 42;
		
        do
        {
			
			switch( state )
			{
				case 0:
					if( info.src.charCodeAt( pos ) == 9 || info.src.charCodeAt( pos ) == 32 ) state = 1;
					else if( info.src.charCodeAt( pos ) == 33 ) state = 2;
					else if( info.src.charCodeAt( pos ) == 37 || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 101 ) || ( info.src.charCodeAt( pos ) >= 103 && info.src.charCodeAt( pos ) <= 115 ) || ( info.src.charCodeAt( pos ) >= 117 && info.src.charCodeAt( pos ) <= 0x2219 ) || ( info.src.charCodeAt( pos ) >= 0x221b && info.src.charCodeAt( pos ) <= 0x80000 ) ) state = 3;
					else if( info.src.charCodeAt( pos ) == 40 ) state = 4;
					else if( info.src.charCodeAt( pos ) == 41 ) state = 5;
					else if( info.src.charCodeAt( pos ) == 42 ) state = 6;
					else if( info.src.charCodeAt( pos ) == 43 ) state = 7;
					else if( info.src.charCodeAt( pos ) == 44 ) state = 8;
					else if( info.src.charCodeAt( pos ) == 45 ) state = 9;
					else if( info.src.charCodeAt( pos ) == 47 ) state = 10;
					else if( info.src.charCodeAt( pos ) == 48 ) state = 11;
					else if( info.src.charCodeAt( pos ) == 60 ) state = 12;
					else if( info.src.charCodeAt( pos ) == 61 ) state = 13;
					else if( info.src.charCodeAt( pos ) == 62 ) state = 14;
					else if( info.src.charCodeAt( pos ) == 91 ) state = 15;
					else if( info.src.charCodeAt( pos ) == 93 ) state = 16;
					else if( info.src.charCodeAt( pos ) == 94 ) state = 17;
					else if( info.src.charCodeAt( pos ) == 0x221a ) state = 18;
					else if( info.src.charCodeAt( pos ) == 34 ) state = 32;
					else if( ( info.src.charCodeAt( pos ) >= 49 && info.src.charCodeAt( pos ) <= 57 ) ) state = 34;
					else if( info.src.charCodeAt( pos ) == 46 ) state = 36;
					else if( info.src.charCodeAt( pos ) == 58 ) state = 37;
					else if( info.src.charCodeAt( pos ) == 116 ) state = 44;
					else if( info.src.charCodeAt( pos ) == 102 ) state = 46;
					else state = -1;
					break;
					
				case 1:
					state = -1;
					match = 1;
					match_pos = pos;
					break;
					
				case 2:
					if( info.src.charCodeAt( pos ) == 61 ) state = 19;
					else state = -1;
					match = 39;
					match_pos = pos;
					break;
					
				case 3:
					if( info.src.charCodeAt( pos ) == 37 || info.src.charCodeAt( pos ) == 46 || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 0x80000 ) ) state = 3;
					else state = -1;
					match = 12;
					match_pos = pos;
					break;
					
				case 4:
					state = -1;
					match = 2;
					match_pos = pos;
					break;
					
				case 5:
					state = -1;
					match = 3;
					match_pos = pos;
					break;
					
				case 6:
					if( info.src.charCodeAt( pos ) == 61 ) state = 20;
					else state = -1;
					match = 35;
					match_pos = pos;
					break;
					
				case 7:
					if( info.src.charCodeAt( pos ) == 61 ) state = 21;
					else state = -1;
					match = 33;
					match_pos = pos;
					break;
					
				case 8:
					state = -1;
					match = 6;
					match_pos = pos;
					break;
					
				case 9:
					if( info.src.charCodeAt( pos ) == 61 ) state = 22;
					else state = -1;
					match = 34;
					match_pos = pos;
					break;
					
				case 10:
					if( info.src.charCodeAt( pos ) == 61 ) state = 24;
					else state = -1;
					match = 36;
					match_pos = pos;
					break;
					
				case 11:
					if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 34;
					else if( info.src.charCodeAt( pos ) == 46 ) state = 36;
					else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 39;
					else if( info.src.charCodeAt( pos ) == 120 ) state = 40;
					else state = -1;
					match = 10;
					match_pos = pos;
					break;
					
				case 12:
					if( info.src.charCodeAt( pos ) == 61 ) state = 26;
					else state = -1;
					match = 26;
					match_pos = pos;
					break;
					
				case 13:
					if( info.src.charCodeAt( pos ) == 61 ) state = 27;
					else state = -1;
					match = 24;
					match_pos = pos;
					break;
					
				case 14:
					if( info.src.charCodeAt( pos ) == 61 ) state = 28;
					else state = -1;
					match = 27;
					match_pos = pos;
					break;
					
				case 15:
					state = -1;
					match = 4;
					match_pos = pos;
					break;
					
				case 16:
					state = -1;
					match = 5;
					match_pos = pos;
					break;
					
				case 17:
					state = -1;
					match = 37;
					match_pos = pos;
					break;
					
				case 18:
					state = -1;
					match = 38;
					match_pos = pos;
					break;
					
				case 19:
					state = -1;
					match = 25;
					match_pos = pos;
					break;
					
				case 20:
					state = -1;
					match = 15;
					match_pos = pos;
					break;
					
				case 21:
					state = -1;
					match = 14;
					match_pos = pos;
					break;
					
				case 22:
					state = -1;
					match = 16;
					match_pos = pos;
					break;
					
				case 23:
					if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 23;
					else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 39;
					else state = -1;
					match = 11;
					match_pos = pos;
					break;
					
				case 24:
					state = -1;
					match = 17;
					match_pos = pos;
					break;
					
				case 25:
					state = -1;
					match = 13;
					match_pos = pos;
					break;
					
				case 26:
					state = -1;
					match = 28;
					match_pos = pos;
					break;
					
				case 27:
					state = -1;
					match = 30;
					match_pos = pos;
					break;
					
				case 28:
					state = -1;
					match = 29;
					match_pos = pos;
					break;
					
				case 29:
					if( info.src.charCodeAt( pos ) == 34 ) state = 29;
					else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 33 ) || ( info.src.charCodeAt( pos ) >= 35 && info.src.charCodeAt( pos ) <= 254 ) ) state = 38;
					else state = -1;
					match = 7;
					match_pos = pos;
					break;
					
				case 30:
					if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 70 ) || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 102 ) ) state = 30;
					else state = -1;
					match = 9;
					match_pos = pos;
					break;
					
				case 31:
					if( info.src.charCodeAt( pos ) == 37 || info.src.charCodeAt( pos ) == 46 || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 0x80000 ) ) state = 3;
					else state = -1;
					match = 8;
					match_pos = pos;
					break;
					
				case 32:
					if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 254 ) ) state = 38;
					else state = -1;
					break;
					
				case 33:
					if( info.src.charCodeAt( pos ) == 37 || info.src.charCodeAt( pos ) == 46 || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 0x80000 ) ) state = 3;
					else if( info.src.charCodeAt( pos ) == 101 ) state = 31;
					else state = -1;
					match = 12;
					match_pos = pos;
					break;
					
				case 34:
					if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 34;
					else if( info.src.charCodeAt( pos ) == 46 ) state = 36;
					else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 39;
					else state = -1;
					match = 10;
					match_pos = pos;
					break;
					
				case 35:
					if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 35;
					else state = -1;
					match = 11;
					match_pos = pos;
					break;
					
				case 36:
					if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 23;
					else state = -1;
					break;
					
				case 37:
					if( info.src.charCodeAt( pos ) == 61 ) state = 25;
					else state = -1;
					break;
					
				case 38:
					if( info.src.charCodeAt( pos ) == 34 ) state = 29;
					else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 33 ) || ( info.src.charCodeAt( pos ) >= 35 && info.src.charCodeAt( pos ) <= 254 ) ) state = 38;
					else state = -1;
					break;
					
				case 39:
					if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 35;
					else if( info.src.charCodeAt( pos ) == 43 || info.src.charCodeAt( pos ) == 45 ) state = 41;
					else state = -1;
					break;
					
				case 40:
					if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 70 ) || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 102 ) ) state = 30;
					else state = -1;
					break;
					
				case 41:
					if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 35;
					else state = -1;
					break;
					
				case 42:
					if( info.src.charCodeAt( pos ) == 37 || info.src.charCodeAt( pos ) == 46 || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 116 ) || ( info.src.charCodeAt( pos ) >= 118 && info.src.charCodeAt( pos ) <= 0x80000 ) ) state = 3;
					else if( info.src.charCodeAt( pos ) == 117 ) state = 33;
					else state = -1;
					match = 12;
					match_pos = pos;
					break;
					
				case 43:
					if( info.src.charCodeAt( pos ) == 37 || info.src.charCodeAt( pos ) == 46 || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 0x80000 ) ) state = 3;
					else if( info.src.charCodeAt( pos ) == 115 ) state = 33;
					else state = -1;
					match = 12;
					match_pos = pos;
					break;
					
				case 44:
					if( info.src.charCodeAt( pos ) == 37 || info.src.charCodeAt( pos ) == 46 || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 0x80000 ) ) state = 3;
					else if( info.src.charCodeAt( pos ) == 114 ) state = 42;
					else state = -1;
					match = 12;
					match_pos = pos;
					break;
					
				case 45:
					if( info.src.charCodeAt( pos ) == 37 || info.src.charCodeAt( pos ) == 46 || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 107 ) || ( info.src.charCodeAt( pos ) >= 109 && info.src.charCodeAt( pos ) <= 0x80000 ) ) state = 3;
					else if( info.src.charCodeAt( pos ) == 108 ) state = 43;
					else state = -1;
					match = 12;
					match_pos = pos;
					break;
					
				case 46:
					if( info.src.charCodeAt( pos ) == 37 || info.src.charCodeAt( pos ) == 46 || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 0x80000 ) ) state = 3;
					else if( info.src.charCodeAt( pos ) == 97 ) state = 45;
					else state = -1;
					match = 12;
					match_pos = pos;
					break;
					
			}
			
			
            pos++;
			
        }
        while( state > -1 );
		
    }
    while( 1 > -1 && match == 1 );
	
    if( match > -1 )
    {
        info.att = info.src.substr( start, match_pos - start );
        info.offset = match_pos;
        
		switch( match )
		{
			case 9:
			{
				info.att = parseInt( info.att ); 
			}
				break;
				
			case 10:
			{
				info.att = parseInt( info.att ); 
			}
				break;
				
			case 11:
			{
				info.att = parseFloat( info.att ); 
			}
				break;
				
		}
		
		
    }
    else
    {
        info.att = new String();
        match = -1;
    }
	
    return match;
}


function __parse( src, err_off, err_la )
{
    var        sstack            = new Array();
    var        vstack            = new Array();
    var     err_cnt            = 0;
    var        act;
    var        go;
    var        la;
    var        rval;
    var     parseinfo        = new Function( "", "var offset; var src; var att;" );
    var        info            = new parseinfo();
    
	/* Pop-Table */
	var pop_tab = new Array(
							new Array( 0/* p' */, 1 ),
							new Array( 41/* p */, 1 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 2 ),
							new Array( 40/* e */, 2 ),
							new Array( 40/* e */, 2 ),
							new Array( 40/* e */, 2 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 4 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 1 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 3 ),
							new Array( 40/* e */, 5 ),
							new Array( 40/* e */, 1 ),
							new Array( 40/* e */, 1 ),
							new Array( 40/* e */, 1 ),
							new Array( 40/* e */, 1 ),
							new Array( 40/* e */, 1 )
							);
	
	/* Action-Table */
	var act_tab = new Array(
							/* State 0 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 1 */ new Array( 42/* "$" */,0 ),
							/* State 2 */ new Array( 6/* "," */,14 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-1 ),
							/* State 3 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 4 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 5 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 6 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 7 */ new Array( 17/* "/=" */,40 , 16/* "-=" */,41 , 15/* "*=" */,42 , 14/* "+=" */,43 , 13/* ":=" */,44 , 2/* "(" */,45 , 42/* "$" */,-34 , 33/* "+" */,-34 , 34/* "-" */,-34 , 35/* "*" */,-34 , 36/* "/" */,-34 , 37/* "^" */,-34 , 24/* "=" */,-34 , 30/* "==" */,-34 , 28/* "<=" */,-34 , 29/* ">=" */,-34 , 26/* "<" */,-34 , 27/* ">" */,-34 , 25/* "!=" */,-34 , 18/* "&&" */,-34 , 19/* "and" */,-34 , 20/* "AND" */,-34 , 21/* "||" */,-34 , 22/* "or" */,-34 , 23/* "OR" */,-34 , 31/* "mod" */,-34 , 32/* "MOD" */,-34 , 39/* "!" */,-34 , 6/* "," */,-34 , 3/* ")" */,-34 , 5/* "]" */,-34 ),
							/* State 8 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 9 */ new Array( 42/* "$" */,-38 , 33/* "+" */,-38 , 34/* "-" */,-38 , 35/* "*" */,-38 , 36/* "/" */,-38 , 37/* "^" */,-38 , 24/* "=" */,-38 , 30/* "==" */,-38 , 28/* "<=" */,-38 , 29/* ">=" */,-38 , 26/* "<" */,-38 , 27/* ">" */,-38 , 25/* "!=" */,-38 , 18/* "&&" */,-38 , 19/* "and" */,-38 , 20/* "AND" */,-38 , 21/* "||" */,-38 , 22/* "or" */,-38 , 23/* "OR" */,-38 , 31/* "mod" */,-38 , 32/* "MOD" */,-38 , 39/* "!" */,-38 , 6/* "," */,-38 , 3/* ")" */,-38 , 5/* "]" */,-38 ),
							/* State 10 */ new Array( 42/* "$" */,-39 , 33/* "+" */,-39 , 34/* "-" */,-39 , 35/* "*" */,-39 , 36/* "/" */,-39 , 37/* "^" */,-39 , 24/* "=" */,-39 , 30/* "==" */,-39 , 28/* "<=" */,-39 , 29/* ">=" */,-39 , 26/* "<" */,-39 , 27/* ">" */,-39 , 25/* "!=" */,-39 , 18/* "&&" */,-39 , 19/* "and" */,-39 , 20/* "AND" */,-39 , 21/* "||" */,-39 , 22/* "or" */,-39 , 23/* "OR" */,-39 , 31/* "mod" */,-39 , 32/* "MOD" */,-39 , 39/* "!" */,-39 , 6/* "," */,-39 , 3/* ")" */,-39 , 5/* "]" */,-39 ),
							/* State 11 */ new Array( 42/* "$" */,-40 , 33/* "+" */,-40 , 34/* "-" */,-40 , 35/* "*" */,-40 , 36/* "/" */,-40 , 37/* "^" */,-40 , 24/* "=" */,-40 , 30/* "==" */,-40 , 28/* "<=" */,-40 , 29/* ">=" */,-40 , 26/* "<" */,-40 , 27/* ">" */,-40 , 25/* "!=" */,-40 , 18/* "&&" */,-40 , 19/* "and" */,-40 , 20/* "AND" */,-40 , 21/* "||" */,-40 , 22/* "or" */,-40 , 23/* "OR" */,-40 , 31/* "mod" */,-40 , 32/* "MOD" */,-40 , 39/* "!" */,-40 , 6/* "," */,-40 , 3/* ")" */,-40 , 5/* "]" */,-40 ),
							/* State 12 */ new Array( 42/* "$" */,-41 , 33/* "+" */,-41 , 34/* "-" */,-41 , 35/* "*" */,-41 , 36/* "/" */,-41 , 37/* "^" */,-41 , 24/* "=" */,-41 , 30/* "==" */,-41 , 28/* "<=" */,-41 , 29/* ">=" */,-41 , 26/* "<" */,-41 , 27/* ">" */,-41 , 25/* "!=" */,-41 , 18/* "&&" */,-41 , 19/* "and" */,-41 , 20/* "AND" */,-41 , 21/* "||" */,-41 , 22/* "or" */,-41 , 23/* "OR" */,-41 , 31/* "mod" */,-41 , 32/* "MOD" */,-41 , 39/* "!" */,-41 , 6/* "," */,-41 , 3/* ")" */,-41 , 5/* "]" */,-41 ),
							/* State 13 */ new Array( 42/* "$" */,-42 , 33/* "+" */,-42 , 34/* "-" */,-42 , 35/* "*" */,-42 , 36/* "/" */,-42 , 37/* "^" */,-42 , 24/* "=" */,-42 , 30/* "==" */,-42 , 28/* "<=" */,-42 , 29/* ">=" */,-42 , 26/* "<" */,-42 , 27/* ">" */,-42 , 25/* "!=" */,-42 , 18/* "&&" */,-42 , 19/* "and" */,-42 , 20/* "AND" */,-42 , 21/* "||" */,-42 , 22/* "or" */,-42 , 23/* "OR" */,-42 , 31/* "mod" */,-42 , 32/* "MOD" */,-42 , 39/* "!" */,-42 , 6/* "," */,-42 , 3/* ")" */,-42 , 5/* "]" */,-42 ),
							/* State 14 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 15 */ new Array( 42/* "$" */,-23 , 33/* "+" */,-23 , 34/* "-" */,-23 , 35/* "*" */,-23 , 36/* "/" */,-23 , 37/* "^" */,-23 , 24/* "=" */,-23 , 30/* "==" */,-23 , 28/* "<=" */,-23 , 29/* ">=" */,-23 , 26/* "<" */,-23 , 27/* ">" */,-23 , 25/* "!=" */,-23 , 18/* "&&" */,-23 , 19/* "and" */,-23 , 20/* "AND" */,-23 , 21/* "||" */,-23 , 22/* "or" */,-23 , 23/* "OR" */,-23 , 31/* "mod" */,-23 , 32/* "MOD" */,-23 , 39/* "!" */,-23 , 6/* "," */,-23 , 3/* ")" */,-23 , 5/* "]" */,-23 ),
							/* State 16 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 17 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 18 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 19 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 20 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 21 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 22 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 23 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 24 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 25 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 26 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 27 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 28 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 29 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 30 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 31 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 32 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 33 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 34 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 35 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 36 */ new Array( 6/* "," */,-22 , 39/* "!" */,15 , 32/* "MOD" */,-22 , 31/* "mod" */,-22 , 23/* "OR" */,-22 , 22/* "or" */,-22 , 21/* "||" */,-22 , 20/* "AND" */,-22 , 19/* "and" */,-22 , 18/* "&&" */,-22 , 25/* "!=" */,-22 , 27/* ">" */,-22 , 26/* "<" */,-22 , 29/* ">=" */,-22 , 28/* "<=" */,-22 , 30/* "==" */,-22 , 24/* "=" */,-22 , 37/* "^" */,-22 , 36/* "/" */,-22 , 35/* "*" */,-22 , 34/* "-" */,-22 , 33/* "+" */,-22 , 42/* "$" */,-22 , 3/* ")" */,-22 , 5/* "]" */,-22 ),
							/* State 37 */ new Array( 6/* "," */,-24 , 39/* "!" */,15 , 32/* "MOD" */,-24 , 31/* "mod" */,-24 , 23/* "OR" */,-24 , 22/* "or" */,-24 , 21/* "||" */,-24 , 20/* "AND" */,-24 , 19/* "and" */,-24 , 18/* "&&" */,-24 , 25/* "!=" */,-24 , 27/* ">" */,-24 , 26/* "<" */,-24 , 29/* ">=" */,-24 , 28/* "<=" */,-24 , 30/* "==" */,-24 , 24/* "=" */,-24 , 37/* "^" */,31 , 36/* "/" */,-24 , 35/* "*" */,-24 , 34/* "-" */,-24 , 33/* "+" */,-24 , 42/* "$" */,-24 , 3/* ")" */,-24 , 5/* "]" */,-24 ),
							/* State 38 */ new Array( 6/* "," */,-25 , 39/* "!" */,15 , 32/* "MOD" */,-25 , 31/* "mod" */,-25 , 23/* "OR" */,-25 , 22/* "or" */,-25 , 21/* "||" */,-25 , 20/* "AND" */,-25 , 19/* "and" */,-25 , 18/* "&&" */,-25 , 25/* "!=" */,-25 , 27/* ">" */,-25 , 26/* "<" */,-25 , 29/* ">=" */,-25 , 28/* "<=" */,-25 , 30/* "==" */,-25 , 24/* "=" */,-25 , 37/* "^" */,31 , 36/* "/" */,-25 , 35/* "*" */,-25 , 34/* "-" */,-25 , 33/* "+" */,-25 , 42/* "$" */,-25 , 3/* ")" */,-25 , 5/* "]" */,-25 ),
							/* State 39 */ new Array( 6/* "," */,68 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 3/* ")" */,69 ),
							/* State 40 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 41 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 42 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 43 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 44 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 45 */ new Array( 3/* ")" */,76 , 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 46 */ new Array( 6/* "," */,14 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 5/* "]" */,77 ),
							/* State 47 */ new Array( 6/* "," */,14 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-35 , 3/* ")" */,-35 , 5/* "]" */,-35 ),
							/* State 48 */ new Array( 6/* "," */,-21 , 39/* "!" */,15 , 32/* "MOD" */,-21 , 31/* "mod" */,-21 , 23/* "OR" */,-21 , 22/* "or" */,-21 , 21/* "||" */,-21 , 20/* "AND" */,-21 , 19/* "and" */,-21 , 18/* "&&" */,-21 , 25/* "!=" */,-21 , 27/* ">" */,-21 , 26/* "<" */,-21 , 29/* ">=" */,-21 , 28/* "<=" */,-21 , 30/* "==" */,-21 , 24/* "=" */,-21 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-21 , 3/* ")" */,-21 , 5/* "]" */,-21 ),
							/* State 49 */ new Array( 6/* "," */,-20 , 39/* "!" */,15 , 32/* "MOD" */,-20 , 31/* "mod" */,-20 , 23/* "OR" */,-20 , 22/* "or" */,-20 , 21/* "||" */,-20 , 20/* "AND" */,-20 , 19/* "and" */,-20 , 18/* "&&" */,-20 , 25/* "!=" */,-20 , 27/* ">" */,-20 , 26/* "<" */,-20 , 29/* ">=" */,-20 , 28/* "<=" */,-20 , 30/* "==" */,-20 , 24/* "=" */,-20 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-20 , 3/* ")" */,-20 , 5/* "]" */,-20 ),
							/* State 50 */ new Array( 6/* "," */,-19 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-19 , 3/* ")" */,-19 , 5/* "]" */,-19 ),
							/* State 51 */ new Array( 6/* "," */,-18 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-18 , 3/* ")" */,-18 , 5/* "]" */,-18 ),
							/* State 52 */ new Array( 6/* "," */,-17 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-17 , 3/* ")" */,-17 , 5/* "]" */,-17 ),
							/* State 53 */ new Array( 6/* "," */,-16 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-16 , 3/* ")" */,-16 , 5/* "]" */,-16 ),
							/* State 54 */ new Array( 6/* "," */,-15 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-15 , 3/* ")" */,-15 , 5/* "]" */,-15 ),
							/* State 55 */ new Array( 6/* "," */,-14 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-14 , 3/* ")" */,-14 , 5/* "]" */,-14 ),
							/* State 56 */ new Array( 6/* "," */,-13 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,-13 , 22/* "or" */,-13 , 21/* "||" */,-13 , 20/* "AND" */,-13 , 19/* "and" */,-13 , 18/* "&&" */,-13 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,-13 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-13 , 3/* ")" */,-13 , 5/* "]" */,-13 ),
							/* State 57 */ new Array( 6/* "," */,-12 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,-12 , 22/* "or" */,-12 , 21/* "||" */,-12 , 20/* "AND" */,-12 , 19/* "and" */,-12 , 18/* "&&" */,-12 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,-12 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-12 , 3/* ")" */,-12 , 5/* "]" */,-12 ),
							/* State 58 */ new Array( 6/* "," */,-11 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,-11 , 22/* "or" */,-11 , 21/* "||" */,-11 , 20/* "AND" */,-11 , 19/* "and" */,-11 , 18/* "&&" */,-11 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,-11 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-11 , 3/* ")" */,-11 , 5/* "]" */,-11 ),
							/* State 59 */ new Array( 6/* "," */,-10 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,-10 , 22/* "or" */,-10 , 21/* "||" */,-10 , 20/* "AND" */,-10 , 19/* "and" */,-10 , 18/* "&&" */,-10 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,-10 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-10 , 3/* ")" */,-10 , 5/* "]" */,-10 ),
							/* State 60 */ new Array( 6/* "," */,-9 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,-9 , 22/* "or" */,-9 , 21/* "||" */,-9 , 20/* "AND" */,-9 , 19/* "and" */,-9 , 18/* "&&" */,-9 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,-9 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-9 , 3/* ")" */,-9 , 5/* "]" */,-9 ),
							/* State 61 */ new Array( 6/* "," */,-8 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,-8 , 22/* "or" */,-8 , 21/* "||" */,-8 , 20/* "AND" */,-8 , 19/* "and" */,-8 , 18/* "&&" */,-8 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,-8 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-8 , 3/* ")" */,-8 , 5/* "]" */,-8 ),
							/* State 62 */ new Array( 6/* "," */,-7 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,-7 , 22/* "or" */,-7 , 21/* "||" */,-7 , 20/* "AND" */,-7 , 19/* "and" */,-7 , 18/* "&&" */,-7 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-7 , 3/* ")" */,-7 , 5/* "]" */,-7 ),
							/* State 63 */ new Array( 6/* "," */,-6 , 39/* "!" */,15 , 32/* "MOD" */,-6 , 31/* "mod" */,-6 , 23/* "OR" */,-6 , 22/* "or" */,-6 , 21/* "||" */,-6 , 20/* "AND" */,-6 , 19/* "and" */,-6 , 18/* "&&" */,-6 , 25/* "!=" */,-6 , 27/* ">" */,-6 , 26/* "<" */,-6 , 29/* ">=" */,-6 , 28/* "<=" */,-6 , 30/* "==" */,-6 , 24/* "=" */,-6 , 37/* "^" */,31 , 36/* "/" */,-6 , 35/* "*" */,-6 , 34/* "-" */,-6 , 33/* "+" */,-6 , 42/* "$" */,-6 , 3/* ")" */,-6 , 5/* "]" */,-6 ),
							/* State 64 */ new Array( 6/* "," */,-5 , 39/* "!" */,15 , 32/* "MOD" */,-5 , 31/* "mod" */,-5 , 23/* "OR" */,-5 , 22/* "or" */,-5 , 21/* "||" */,-5 , 20/* "AND" */,-5 , 19/* "and" */,-5 , 18/* "&&" */,-5 , 25/* "!=" */,-5 , 27/* ">" */,-5 , 26/* "<" */,-5 , 29/* ">=" */,-5 , 28/* "<=" */,-5 , 30/* "==" */,-5 , 24/* "=" */,-5 , 37/* "^" */,31 , 36/* "/" */,-5 , 35/* "*" */,-5 , 34/* "-" */,-5 , 33/* "+" */,-5 , 42/* "$" */,-5 , 3/* ")" */,-5 , 5/* "]" */,-5 ),
							/* State 65 */ new Array( 6/* "," */,-4 , 39/* "!" */,15 , 32/* "MOD" */,-4 , 31/* "mod" */,-4 , 23/* "OR" */,-4 , 22/* "or" */,-4 , 21/* "||" */,-4 , 20/* "AND" */,-4 , 19/* "and" */,-4 , 18/* "&&" */,-4 , 25/* "!=" */,-4 , 27/* ">" */,-4 , 26/* "<" */,-4 , 29/* ">=" */,-4 , 28/* "<=" */,-4 , 30/* "==" */,-4 , 24/* "=" */,-4 , 37/* "^" */,31 , 36/* "/" */,-4 , 35/* "*" */,-4 , 34/* "-" */,-4 , 33/* "+" */,-4 , 42/* "$" */,-4 , 3/* ")" */,-4 , 5/* "]" */,-4 ),
							/* State 66 */ new Array( 6/* "," */,-3 , 39/* "!" */,15 , 32/* "MOD" */,-3 , 31/* "mod" */,-3 , 23/* "OR" */,-3 , 22/* "or" */,-3 , 21/* "||" */,-3 , 20/* "AND" */,-3 , 19/* "and" */,-3 , 18/* "&&" */,-3 , 25/* "!=" */,-3 , 27/* ">" */,-3 , 26/* "<" */,-3 , 29/* ">=" */,-3 , 28/* "<=" */,-3 , 30/* "==" */,-3 , 24/* "=" */,-3 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,-3 , 33/* "+" */,-3 , 42/* "$" */,-3 , 3/* ")" */,-3 , 5/* "]" */,-3 ),
							/* State 67 */ new Array( 6/* "," */,-2 , 39/* "!" */,15 , 32/* "MOD" */,-2 , 31/* "mod" */,-2 , 23/* "OR" */,-2 , 22/* "or" */,-2 , 21/* "||" */,-2 , 20/* "AND" */,-2 , 19/* "and" */,-2 , 18/* "&&" */,-2 , 25/* "!=" */,-2 , 27/* ">" */,-2 , 26/* "<" */,-2 , 29/* ">=" */,-2 , 28/* "<=" */,-2 , 30/* "==" */,-2 , 24/* "=" */,-2 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,-2 , 33/* "+" */,-2 , 42/* "$" */,-2 , 3/* ")" */,-2 , 5/* "]" */,-2 ),
							/* State 68 */ new Array( 38/* "0x221a" */,3 , 34/* "-" */,4 , 33/* "+" */,5 , 2/* "(" */,6 , 12/* "IDEN" */,7 , 4/* "[" */,8 , 7/* "STRING" */,9 , 8/* "BOOL" */,10 , 10/* "INT" */,11 , 9/* "HEXINT" */,12 , 11/* "FLOAT" */,13 ),
							/* State 69 */ new Array( 42/* "$" */,-26 , 33/* "+" */,-26 , 34/* "-" */,-26 , 35/* "*" */,-26 , 36/* "/" */,-26 , 37/* "^" */,-26 , 24/* "=" */,-26 , 30/* "==" */,-26 , 28/* "<=" */,-26 , 29/* ">=" */,-26 , 26/* "<" */,-26 , 27/* ">" */,-26 , 25/* "!=" */,-26 , 18/* "&&" */,-26 , 19/* "and" */,-26 , 20/* "AND" */,-26 , 21/* "||" */,-26 , 22/* "or" */,-26 , 23/* "OR" */,-26 , 31/* "mod" */,-26 , 32/* "MOD" */,-26 , 39/* "!" */,-26 , 6/* "," */,-26 , 3/* ")" */,-26 , 5/* "]" */,-26 ),
							/* State 70 */ new Array( 6/* "," */,-33 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-33 , 3/* ")" */,-33 , 5/* "]" */,-33 ),
							/* State 71 */ new Array( 6/* "," */,-32 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-32 , 3/* ")" */,-32 , 5/* "]" */,-32 ),
							/* State 72 */ new Array( 6/* "," */,-31 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-31 , 3/* ")" */,-31 , 5/* "]" */,-31 ),
							/* State 73 */ new Array( 6/* "," */,-30 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-30 , 3/* ")" */,-30 , 5/* "]" */,-30 ),
							/* State 74 */ new Array( 6/* "," */,-29 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 42/* "$" */,-29 , 3/* ")" */,-29 , 5/* "]" */,-29 ),
							/* State 75 */ new Array( 6/* "," */,14 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 3/* ")" */,79 ),
							/* State 76 */ new Array( 42/* "$" */,-28 , 33/* "+" */,-28 , 34/* "-" */,-28 , 35/* "*" */,-28 , 36/* "/" */,-28 , 37/* "^" */,-28 , 24/* "=" */,-28 , 30/* "==" */,-28 , 28/* "<=" */,-28 , 29/* ">=" */,-28 , 26/* "<" */,-28 , 27/* ">" */,-28 , 25/* "!=" */,-28 , 18/* "&&" */,-28 , 19/* "and" */,-28 , 20/* "AND" */,-28 , 21/* "||" */,-28 , 22/* "or" */,-28 , 23/* "OR" */,-28 , 31/* "mod" */,-28 , 32/* "MOD" */,-28 , 39/* "!" */,-28 , 6/* "," */,-28 , 3/* ")" */,-28 , 5/* "]" */,-28 ),
							/* State 77 */ new Array( 42/* "$" */,-36 , 33/* "+" */,-36 , 34/* "-" */,-36 , 35/* "*" */,-36 , 36/* "/" */,-36 , 37/* "^" */,-36 , 24/* "=" */,-36 , 30/* "==" */,-36 , 28/* "<=" */,-36 , 29/* ">=" */,-36 , 26/* "<" */,-36 , 27/* ">" */,-36 , 25/* "!=" */,-36 , 18/* "&&" */,-36 , 19/* "and" */,-36 , 20/* "AND" */,-36 , 21/* "||" */,-36 , 22/* "or" */,-36 , 23/* "OR" */,-36 , 31/* "mod" */,-36 , 32/* "MOD" */,-36 , 39/* "!" */,-36 , 6/* "," */,-36 , 3/* ")" */,-36 , 5/* "]" */,-36 ),
							/* State 78 */ new Array( 6/* "," */,14 , 39/* "!" */,15 , 32/* "MOD" */,16 , 31/* "mod" */,17 , 23/* "OR" */,18 , 22/* "or" */,19 , 21/* "||" */,20 , 20/* "AND" */,21 , 19/* "and" */,22 , 18/* "&&" */,23 , 25/* "!=" */,24 , 27/* ">" */,25 , 26/* "<" */,26 , 29/* ">=" */,27 , 28/* "<=" */,28 , 30/* "==" */,29 , 24/* "=" */,30 , 37/* "^" */,31 , 36/* "/" */,32 , 35/* "*" */,33 , 34/* "-" */,34 , 33/* "+" */,35 , 3/* ")" */,80 ),
							/* State 79 */ new Array( 42/* "$" */,-27 , 33/* "+" */,-27 , 34/* "-" */,-27 , 35/* "*" */,-27 , 36/* "/" */,-27 , 37/* "^" */,-27 , 24/* "=" */,-27 , 30/* "==" */,-27 , 28/* "<=" */,-27 , 29/* ">=" */,-27 , 26/* "<" */,-27 , 27/* ">" */,-27 , 25/* "!=" */,-27 , 18/* "&&" */,-27 , 19/* "and" */,-27 , 20/* "AND" */,-27 , 21/* "||" */,-27 , 22/* "or" */,-27 , 23/* "OR" */,-27 , 31/* "mod" */,-27 , 32/* "MOD" */,-27 , 39/* "!" */,-27 , 6/* "," */,-27 , 3/* ")" */,-27 , 5/* "]" */,-27 ),
							/* State 80 */ new Array( 42/* "$" */,-37 , 33/* "+" */,-37 , 34/* "-" */,-37 , 35/* "*" */,-37 , 36/* "/" */,-37 , 37/* "^" */,-37 , 24/* "=" */,-37 , 30/* "==" */,-37 , 28/* "<=" */,-37 , 29/* ">=" */,-37 , 26/* "<" */,-37 , 27/* ">" */,-37 , 25/* "!=" */,-37 , 18/* "&&" */,-37 , 19/* "and" */,-37 , 20/* "AND" */,-37 , 21/* "||" */,-37 , 22/* "or" */,-37 , 23/* "OR" */,-37 , 31/* "mod" */,-37 , 32/* "MOD" */,-37 , 39/* "!" */,-37 , 6/* "," */,-37 , 3/* ")" */,-37 , 5/* "]" */,-37 )
							);
	
	/* Goto-Table */
	var goto_tab = new Array(
							 /* State 0 */ new Array( 41/* p */,1 , 40/* e */,2 ),
							 /* State 1 */ new Array( ),
							 /* State 2 */ new Array( ),
							 /* State 3 */ new Array( 40/* e */,36 ),
							 /* State 4 */ new Array( 40/* e */,37 ),
							 /* State 5 */ new Array( 40/* e */,38 ),
							 /* State 6 */ new Array( 40/* e */,39 ),
							 /* State 7 */ new Array( ),
							 /* State 8 */ new Array( 40/* e */,46 ),
							 /* State 9 */ new Array( ),
							 /* State 10 */ new Array( ),
							 /* State 11 */ new Array( ),
							 /* State 12 */ new Array( ),
							 /* State 13 */ new Array( ),
							 /* State 14 */ new Array( 40/* e */,47 ),
							 /* State 15 */ new Array( ),
							 /* State 16 */ new Array( 40/* e */,48 ),
							 /* State 17 */ new Array( 40/* e */,49 ),
							 /* State 18 */ new Array( 40/* e */,50 ),
							 /* State 19 */ new Array( 40/* e */,51 ),
							 /* State 20 */ new Array( 40/* e */,52 ),
							 /* State 21 */ new Array( 40/* e */,53 ),
							 /* State 22 */ new Array( 40/* e */,54 ),
							 /* State 23 */ new Array( 40/* e */,55 ),
							 /* State 24 */ new Array( 40/* e */,56 ),
							 /* State 25 */ new Array( 40/* e */,57 ),
							 /* State 26 */ new Array( 40/* e */,58 ),
							 /* State 27 */ new Array( 40/* e */,59 ),
							 /* State 28 */ new Array( 40/* e */,60 ),
							 /* State 29 */ new Array( 40/* e */,61 ),
							 /* State 30 */ new Array( 40/* e */,62 ),
							 /* State 31 */ new Array( 40/* e */,63 ),
							 /* State 32 */ new Array( 40/* e */,64 ),
							 /* State 33 */ new Array( 40/* e */,65 ),
							 /* State 34 */ new Array( 40/* e */,66 ),
							 /* State 35 */ new Array( 40/* e */,67 ),
							 /* State 36 */ new Array( ),
							 /* State 37 */ new Array( ),
							 /* State 38 */ new Array( ),
							 /* State 39 */ new Array( ),
							 /* State 40 */ new Array( 40/* e */,70 ),
							 /* State 41 */ new Array( 40/* e */,71 ),
							 /* State 42 */ new Array( 40/* e */,72 ),
							 /* State 43 */ new Array( 40/* e */,73 ),
							 /* State 44 */ new Array( 40/* e */,74 ),
							 /* State 45 */ new Array( 40/* e */,75 ),
							 /* State 46 */ new Array( ),
							 /* State 47 */ new Array( ),
							 /* State 48 */ new Array( ),
							 /* State 49 */ new Array( ),
							 /* State 50 */ new Array( ),
							 /* State 51 */ new Array( ),
							 /* State 52 */ new Array( ),
							 /* State 53 */ new Array( ),
							 /* State 54 */ new Array( ),
							 /* State 55 */ new Array( ),
							 /* State 56 */ new Array( ),
							 /* State 57 */ new Array( ),
							 /* State 58 */ new Array( ),
							 /* State 59 */ new Array( ),
							 /* State 60 */ new Array( ),
							 /* State 61 */ new Array( ),
							 /* State 62 */ new Array( ),
							 /* State 63 */ new Array( ),
							 /* State 64 */ new Array( ),
							 /* State 65 */ new Array( ),
							 /* State 66 */ new Array( ),
							 /* State 67 */ new Array( ),
							 /* State 68 */ new Array( 40/* e */,78 ),
							 /* State 69 */ new Array( ),
							 /* State 70 */ new Array( ),
							 /* State 71 */ new Array( ),
							 /* State 72 */ new Array( ),
							 /* State 73 */ new Array( ),
							 /* State 74 */ new Array( ),
							 /* State 75 */ new Array( ),
							 /* State 76 */ new Array( ),
							 /* State 77 */ new Array( ),
							 /* State 78 */ new Array( ),
							 /* State 79 */ new Array( ),
							 /* State 80 */ new Array( )
							 );
	
	
	
	/* Symbol labels */
	var labels = new Array(
						   "p'" /* Non-terminal symbol */,
						   "WHITESPACE" /* Terminal symbol */,
						   "(" /* Terminal symbol */,
						   ")" /* Terminal symbol */,
						   "[" /* Terminal symbol */,
						   "]" /* Terminal symbol */,
						   "," /* Terminal symbol */,
						   "STRING" /* Terminal symbol */,
						   "BOOL" /* Terminal symbol */,
						   "HEXINT" /* Terminal symbol */,
						   "INT" /* Terminal symbol */,
						   "FLOAT" /* Terminal symbol */,
						   "IDEN" /* Terminal symbol */,
						   ":=" /* Terminal symbol */,
						   "+=" /* Terminal symbol */,
						   "*=" /* Terminal symbol */,
						   "-=" /* Terminal symbol */,
						   "/=" /* Terminal symbol */,
						   "&&" /* Terminal symbol */,
						   "and" /* Terminal symbol */,
						   "AND" /* Terminal symbol */,
						   "||" /* Terminal symbol */,
						   "or" /* Terminal symbol */,
						   "OR" /* Terminal symbol */,
						   "=" /* Terminal symbol */,
						   "!=" /* Terminal symbol */,
						   "<" /* Terminal symbol */,
						   ">" /* Terminal symbol */,
						   "<=" /* Terminal symbol */,
						   ">=" /* Terminal symbol */,
						   "==" /* Terminal symbol */,
						   "mod" /* Terminal symbol */,
						   "MOD" /* Terminal symbol */,
						   "+" /* Terminal symbol */,
						   "-" /* Terminal symbol */,
						   "*" /* Terminal symbol */,
						   "/" /* Terminal symbol */,
						   "^" /* Terminal symbol */,
						   "0x221a" /* Terminal symbol */,
						   "!" /* Terminal symbol */,
						   "e" /* Non-terminal symbol */,
						   "p" /* Non-terminal symbol */,
						   "$" /* Terminal symbol */
						   );
	
	
    
    info.offset = 0;
    info.src = src;
    info.att = new String();
    
    if( !err_off )
        err_off    = new Array();
    if( !err_la )
		err_la = new Array();
    
    sstack.push( 0 );
    vstack.push( 0 );
    
    la = __lex( info );
	
    while( true )
    {
        act = 82;
        for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
        {
            if( act_tab[sstack[sstack.length-1]][i] == la )
            {
                act = act_tab[sstack[sstack.length-1]][i+1];
                break;
            }
        }
		
        if( _dbg_withtrace && sstack.length > 0 )
        {
            __dbg_print( "\nState " + sstack[sstack.length-1] + "\n" +
						"\tLookahead: " + labels[la] + " (\"" + info.att + "\")\n" +
						"\tAction: " + act + "\n" + 
						"\tSource: \"" + info.src.substr( info.offset, 30 ) + ( ( info.offset + 30 < info.src.length ) ?
																			   "..." : "" ) + "\"\n" +
						"\tStack: " + sstack.join() + "\n" +
						"\tValue stack: " + vstack.join() + "\n" );
        }
        
		
        //Panic-mode: Try recovery when parse-error occurs!
        if( act == 82 )
        {
            if( _dbg_withtrace )
                __dbg_print( "Error detected: There is no reduce or shift on the symbol " + labels[la] );
            
            err_cnt++;
            err_off.push( info.offset - info.att.length );            
            err_la.push( new Array() );
            for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
                err_la[err_la.length-1].push( labels[act_tab[sstack[sstack.length-1]][i]] );
            
            //Remember the original stack!
            var rsstack = new Array();
            var rvstack = new Array();
            for( var i = 0; i < sstack.length; i++ )
            {
                rsstack[i] = sstack[i];
                rvstack[i] = vstack[i];
            }
            
            while( act == 82 && la != 42 )
            {
                if( _dbg_withtrace )
                    __dbg_print( "\tError recovery\n" +
								"Current lookahead: " + labels[la] + " (" + info.att + ")\n" +
								"Action: " + act + "\n\n" );
                if( la == -1 )
                    info.offset++;
				
                while( act == 82 && sstack.length > 0 )
                {
                    sstack.pop();
                    vstack.pop();
                    
                    if( sstack.length == 0 )
                        break;
					
                    act = 82;
                    for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
                    {
                        if( act_tab[sstack[sstack.length-1]][i] == la )
                        {
                            act = act_tab[sstack[sstack.length-1]][i+1];
                            break;
                        }
                    }
                }
                
                if( act != 82 )
                    break;
                
                for( var i = 0; i < rsstack.length; i++ )
                {
                    sstack.push( rsstack[i] );
                    vstack.push( rvstack[i] );
                }
                
                la = __lex( info );
            }
            
            if( act == 82 )
            {
                if( _dbg_withtrace )
                    __dbg_print( "\tError recovery failed, terminating parse process..." );
                break;
            }
			
			
            if( _dbg_withtrace )
                __dbg_print( "\tError recovery succeeded, continuing" );
        }
        
        /*
		 if( act == 82 )
		 break;
		 */
        
        
        //Shift
        if( act > 0 )
        {            
            if( _dbg_withtrace )
                __dbg_print( "Shifting symbol: " + labels[la] + " (" + info.att + ")" );
			
            sstack.push( act );
            vstack.push( info.att );
            
            la = __lex( info );
            
            if( _dbg_withtrace )
                __dbg_print( "\tNew lookahead symbol: " + labels[la] + " (" + info.att + ")" );
        }
        //Reduce
        else
        {        
            act *= -1;
            
            if( _dbg_withtrace )
                __dbg_print( "Reducing by producution: " + act );
            
            rval = void(0);
            
            if( _dbg_withtrace )
                __dbg_print( "\tPerforming semantic action..." );
            
			switch( act )
			{
				case 0:
				{
					rval = vstack[ vstack.length - 1 ];
				}
					break;
				case 1:
				{
					return( vstack[ vstack.length - 1 ] ); 
				}
					break;
				case 2:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 3:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 4:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 5:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 6:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 7:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 8:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 9:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 10:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 11:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 12:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 13:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 14:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 15:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 16:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 17:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 18:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 19:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 20:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 21:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ], vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 22:
				{
					rval = calculator.calc(vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ]); 
				}
					break;
				case 23:
				{
					rval = calculator.calc(vstack[ vstack.length - 2 ], "factorial"); 
				}
					break;
				case 24:
				{
					rval = calculator.calc(vstack[ vstack.length - 1 ], "neg"); 
				}
					break;
				case 25:
				{
					rval = vstack[ vstack.length - 1 ]; 
				}
					break;
				case 26:
				{
					rval = vstack[ vstack.length - 2 ]; 
				}
					break;
				case 27:
				{
					if (typeof vstack[ vstack.length - 2 ] == "number") rval = calculator.calc(vstack[ vstack.length - 2 ], vstack[ vstack.length - 4 ]); else { var arr = vstack[ vstack.length - 2 ].split('|'); arr.push(vstack[ vstack.length - 4 ]); rval = calculator.calc.apply(calculator, arr); } 
				}
					break;
				case 28:
				{
					rval = calculator.calc(vstack[ vstack.length - 3 ]); 
				}
					break;
				case 29:
				{
					rval = vars[vstack[ vstack.length - 3 ]] = vstack[ vstack.length - 1 ]; 
				}
					break;
				case 30:
				{
					rval = (vars[vstack[ vstack.length - 3 ]] += vstack[ vstack.length - 1 ]); 
				}
					break;
				case 31:
				{
					rval = (vars[vstack[ vstack.length - 3 ]] *= vstack[ vstack.length - 1 ]); 
				}
					break;
				case 32:
				{
					rval = (vars[vstack[ vstack.length - 3 ]] -= vstack[ vstack.length - 1 ]); 
				}
					break;
				case 33:
				{
					rval = (vars[vstack[ vstack.length - 3 ]] /= vstack[ vstack.length - 1 ]); 
				}
					break;
				case 34:
				{
					rval = calculator.variable(vstack[ vstack.length - 1 ]); 
				}
					break;
				case 35:
				{
					rval = vstack[ vstack.length - 3 ].toString() + '|' + vstack[ vstack.length - 1 ].toString(); 
				}
					break;
				case 36:
				{
					rval = '[' + vstack[ vstack.length - 2 ].split('|').toString() + ']'; 
				}
					break;
				case 37:
				{
					rval = '(' + vstack[ vstack.length - 4 ].toString() + ',' + vstack[ vstack.length - 2 ].toString() + ')'; 
				}
					break;
				case 38:
				{
					rval = vstack[ vstack.length - 1 ];
				}
					break;
				case 39:
				{
					rval = vstack[ vstack.length - 1 ];
				}
					break;
				case 40:
				{
					rval = vstack[ vstack.length - 1 ];
				}
					break;
				case 41:
				{
					rval = vstack[ vstack.length - 1 ];
				}
					break;
				case 42:
				{
					rval = vstack[ vstack.length - 1 ];
				}
					break;
			}
			
			
			
            if( _dbg_withtrace )
                __dbg_print( "\tPopping " + pop_tab[act][1] + " off the stack..." );
			
            for( var i = 0; i < pop_tab[act][1]; i++ )
            {
                sstack.pop();
                vstack.pop();
            }
			
            go = -1;
            for( var i = 0; i < goto_tab[sstack[sstack.length-1]].length; i+=2 )
            {
                if( goto_tab[sstack[sstack.length-1]][i] == pop_tab[act][0] )
                {
                    go = goto_tab[sstack[sstack.length-1]][i+1];
                    break;
                }
            }
            
            if( act == 0 )
                break;
			
            if( _dbg_withtrace )
                __dbg_print( "\tPushing non-terminal " + labels[ pop_tab[act][0] ] );
			
            sstack.push( go );
            vstack.push( rval );            
        }
        
        if( _dbg_withtrace )
        {        
            alert( _dbg_string );
            _dbg_string = new String();
        }
    }
	
	/**/ throw Error("incorrect syntax");
    if( _dbg_withtrace )
    {
        __dbg_print( "\nParse complete." );
        alert( _dbg_string );
    }
    
    return err_cnt;
}
