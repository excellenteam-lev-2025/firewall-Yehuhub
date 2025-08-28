#include <curl/curl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <cjson/cJSON.h>
#include <linux/netlink.h>


struct string{
    char *ptr;
    size_t length;
};

struct ip_list{
    char **ips;
    size_t count;
};

void add_ip(struct ip_list *list, const char *ip){
    char **new_array = realloc(list->ips, (list->count + 1) * sizeof(char*));
    if(!new_array){
        fprintf(stderr, "Memory allocation failed!\n");
        return;
    }
    list->ips = new_array;
    list->ips[list->count] = strdup(ip);
    if(!list->ips[list->count]){
        fprintf(stderr, "memory allocation failed!\n");
        return;
    }
    list->count++;
};

void free_ip_list(struct ip_list *list){
    for(size_t i = 0; i < list->count; i++){
        free(list->ips[i]);
    }
    free(list->ips);
    list->ips = NULL;
    list->count = 0;
};

void init_string(struct string *s){
    s->length = 0;
    s->ptr = malloc(1);
    s->ptr[0] = '\0';
};

size_t writefunc(void *ptr, size_t size, size_t nmemb, struct string *s){
    size_t new_len = s->length + size * nmemb;
    s->ptr = realloc(s->ptr, new_len + 1);
    memcpy(s->ptr + s->length, ptr, size * nmemb);
    s->ptr[new_len] = '\0';
    s->length = new_len;
    return size * nmemb;
};

int fetch_data(const char *url, struct string *out){
    CURL *curl;
    CURLcode res;


    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();

    if(!curl){
        fprintf(stderr, "failed to init curl!\n");
        return 1;
    }

    init_string(out);

    curl_easy_setopt(curl, CURLOPT_URL, url);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writefunc);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, out);

    res = curl_easy_perform(curl);
    if(res != CURLE_OK){
        fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        curl_easy_cleanup(curl);
        curl_global_cleanup();
        return 1;
    }
    
    curl_easy_cleanup(curl);
    curl_global_cleanup();
    return 0;
};

int process_json(const char *json_str, struct ip_list *il){
    cJSON *json = cJSON_Parse(json_str);
    if(json == NULL){
        const char *err_ptr = cJSON_GetErrorPtr();
        if(err_ptr){
            fprintf(stderr, "JSON parse error: %s\n", err_ptr);
        }
        return 1;
    }

    cJSON *ips = cJSON_GetObjectItem(json, "ips");
    if(cJSON_IsObject(ips)){
        cJSON *blacklist = cJSON_GetObjectItem(ips, "blacklist");
        if(cJSON_IsArray(blacklist)){
            cJSON *entry = NULL;
            cJSON_ArrayForEach(entry, blacklist){
                cJSON *value = cJSON_GetObjectItem(entry, "value");
                if(cJSON_IsString(value) && (value->valuestring != NULL)){
                    add_ip(il, value->valuestring);
                }
            }
        }
    }
    cJSON_Delete(json);
    return 0;
};

//"http://localhost:3000/api/firewall/rules"
int main(void){
    struct string s;
    struct ip_list il = {NULL, 0};

    if(fetch_data("http://localhost:3000/api/firewall/rules", &s) != 0){
        return 1;
    }

    if(process_json(s.ptr, &il) != 0){
        return 1;
    }

    for(size_t i = 0; i < il.count; i++){
        printf("%s\n", il.ips[i]);
    }

    free(s.ptr);
    free_ip_list(&il);
    return 0;
};