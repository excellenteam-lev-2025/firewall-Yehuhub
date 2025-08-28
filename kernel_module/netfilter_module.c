#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/netfilter.h>
#include <linux/netfilter_ipv4.h>
#include <linux/skbuff.h>
#include <linux/ip.h>
#include <linux/tcp.h>
#include <linux/udp.h>
#include <linux/inet.h>
#include <linux/list.h>
#include <linux/slab.h>


MODULE_LICENSE("GPL");
MODULE_AUTHOR("Yehu Raccah");


//--------------LIST OF BLOCKED IPS----------------
struct blocked_ip{
    __be32 ip;
    struct list_head list;
};

static LIST_HEAD(blocked_src_ip_list);
static LIST_HEAD(blocked_dest_ip_list);

static void add_blocked_ip(const char *ip_str, struct list_head *list){
    struct blocked_ip *node;

    node = kmalloc(sizeof(*node), GFP_KERNEL);
    if (!node){
        return;
    }
    
    node->ip = in_aton(ip_str);
    list_add(&node->list, list);
};

static void free_lists(void){
    struct blocked_ip *node, *tmp;

    list_for_each_entry_safe(node, tmp, &blocked_src_ip_list, list){
        list_del(&node->list);
        kfree(node);
    }

    list_for_each_entry_safe(node, tmp, &blocked_dest_ip_list, list){
        list_del(&node->list);
        kfree(node);
    }
};


//---------------NETFILTER HOOKS----------------
static unsigned int hook_func(void *priv, struct sk_buff *skb, const struct nf_hook_state *state){
    struct iphdr *ip_header;
    struct blocked_ip *node;

    if(!skb){
        return NF_ACCEPT;
    }

    ip_header = ip_hdr(skb);
    if(!ip_header){
        printk(KERN_INFO "NETFILTER: NO IP HEADERS\n");
        return NF_ACCEPT;
    }
    __be32 src_ip = ip_header->saddr;
    __be32 dest_ip = ip_header->daddr;

    //--------drop ip's---------
    list_for_each_entry(node, &blocked_src_ip_list, list){
        if(src_ip == node->ip){
            printk(KERN_INFO "NETFILTER: Packet from: %pI4 DROPPED!\n", &src_ip);
            return NF_DROP;
        }
    }

    list_for_each_entry(node, &blocked_dest_ip_list, list){
        if(src_ip == node->ip){
            printk(KERN_INFO "NETFILTER: Packet to: %pI4 DROPPED!\n", &src_ip);
            return NF_DROP;
        }
    }


    printk(KERN_INFO "NETFILTER: Packet from: %pI4 to: %pI4 accepted\n", &src_ip, &dest_ip);
    return NF_ACCEPT;
};

static struct nf_hook_ops my_nho = {
    .hook = hook_func,
    .pf = PF_INET,
    .hooknum = NF_INET_PRE_ROUTING,
    .priority = NF_IP_PRI_FIRST,
};


static unsigned int port_hook_func(void *priv, struct sk_buff *skb, const struct nf_hook_state *state){
    
    struct tcphdr *tcp_header;
    struct udphdr *udp_header;
    struct iphdr *ip_header;

    if(!skb){
        return NF_ACCEPT;
    }

    return NF_ACCEPT;

};


//---------------MODULE INIT/EXIT--------------------
static int __init my_init(void){
    nf_register_net_hook(&init_net, &my_nho);

    add_blocked_ip("127.0.0.1", &blocked_src_ip_list);
    add_blocked_ip("8.8.8.8", &blocked_dest_ip_list);


    printk(KERN_INFO "NETFILTER: hook registered\n");
    return 0;
};

static void __exit my_exit(void){

    printk(KERN_INFO "NETFILTER: hook unregistered\n");
    nf_unregister_net_hook(&init_net, &my_nho);

    free_lists();

};


module_init(my_init);
module_exit(my_exit);