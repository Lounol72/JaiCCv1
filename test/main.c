//#include "../include/main.h"

int verbose=FALSE;
int protected_flag=0;
char * src_path=NULL;
char default_output[]="output.c";
char * dest_path=default_output;
char preprocessed_file_path[]="temp_src_file.c";
char command[MAX_DEPTH];
FILE * src_file;
FILE * dest_file;

char actual_char;

char quote_stack[MAX_DEPTH];
int ind_stack=-1;

int char_to_del(char c){
	return (int)c<32;
}


int main(int argc, char * argv[]){
	int opt;

	while ((opt = getopt (argc, argv, "vco:")) != -1){
    	switch (opt){
			case 'v':
				verbose=TRUE;
				break;
			case 'o':
				dest_path=optarg;
				break;
			case 'c':
				
      		default:
	      		abort ();
      	}
	}
	
	if(argc-optind!=1){
		fprintf(stderr,"Missing parameter : <src_file_name>\nUsage : %s [options] <src_file_name>\n",argv[0]);
		exit(PARAMETER_ERROR);
	}

	src_path=argv[optind];
	sprintf(command,"gcc -E -P %s > %s",src_path,preprocessed_file_path);
	system(command);

	src_file=fopen(preprocessed_file_path,"r");
	dest_file=fopen(dest_path,"w");
	if(src_file==NULL || dest_file==NULL){
		fprintf(stderr,"Cannot open one of the file\n");
		exit(FILE_ERROR);
	}

	do{
		actual_char=fgetc(src_file);
		if(actual_char!=EOF && (ind_stack>=0 || !char_to_del(actual_char))){
			fputc(actual_char,dest_file);
			if(verbose) printf("%c",actual_char);
			if(ind_stack>=0 && actual_char==quote_stack[ind_stack]) ind_stack--;
			else if(!protected_flag && (actual_char=='\"' || actual_char=="\'"[0])) quote_stack[++ind_stack]=actual_char;
			if(actual_char=='\\') protected_flag=1;
			else protected_flag=0;
		}
		else fputc(' ',dest_file);
	} while(!feof(src_file));

	fclose(src_file);
	fclose(dest_file);
	sprintf(command,"rm %s",preprocessed_file_path);
	system(command);
	return 0;
}