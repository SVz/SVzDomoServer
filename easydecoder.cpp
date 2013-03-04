// g++ -o easydecoder easydecoder.cpp -lwiringPi -lrt
// use the line above to compile this.

#define MINCYCLE 200000
#define MAXCYCLE 2800000
#define THRESHOLD 1000000

#include <wiringPi.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <dirent.h>
#include <fcntl.h>
#include <assert.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <time.h>
#include <unistd.h>
#include <math.h>

int main(int argc, char **argv)
{
        int times[10000];
        int timeIndex = 0;

        char bits[100];
        char IDdevice[100];
	char Codedevice[8];
        int bitIndex = 0;
        int loToHiTime;
        int hiToLoTime;

        timespec t,sleepTime;
        sleepTime.tv_sec = 0;
        sleepTime.tv_nsec = 50000;

        int currentTime = 0;

        char temp[100];

        int missedLoToHi = 0;
        int missedHiToLo = 0;
        int wrongTime = 0;

 	if (argv[1]=="")
	{
		printf("Usage : easydecoder pinnumber\n");
		fflush(stdout);
		return 0;
	}
	int pin = atoi(argv[1]);
	
        wiringPiSetupSys();

        pinMode (pin, INPUT);

        sprintf(temp, "gpio edge %d both",pin);
        printf("%s\n",temp);

        system(temp);


        bitIndex = 0;
        memset(bits,0,100);

        waitForInterrupt(pin, 1000);
        while (!digitalRead(pin) == 0)
        {
                waitForInterrupt(pin, 1000);
                clock_gettime(CLOCK_MONOTONIC, &t);
        }

        while (1)
        {
                loToHiTime = t.tv_nsec;
                waitForInterrupt(pin, 1000);
                clock_gettime(CLOCK_MONOTONIC, &t);
                if (nanosleep(&sleepTime,NULL))
                {
                         printf("Sleep error\n");
                }
                if (digitalRead(pin))
                {
                        bitIndex = 0;
                        missedHiToLo ++;
                }
                else
                {
                        hiToLoTime = t.tv_nsec;

                        waitForInterrupt(pin, 1000);
                        clock_gettime(CLOCK_MONOTONIC, &t);
                        nanosleep(&sleepTime,NULL);
                        if (!digitalRead(pin))
                        {
                                missedLoToHi ++;
                                bitIndex = 0;
                                while (!digitalRead(pin))
                                {
                                        waitForInterrupt(pin, 1000);
                                        clock_gettime(CLOCK_MONOTONIC, &t);
                                }
                        }
                        else
                        {
                                int totalTime = t.tv_nsec - loToHiTime;
				int lowDuration = t.tv_nsec - hiToLoTime;

                                if (totalTime < 0)
                                {
                                        totalTime += 1000000000;
                                }

                               	if (totalTime < MINCYCLE || totalTime > MAXCYCLE)
                               	{
                                 	wrongTime++;
                                        bitIndex = 0;
				}
                                else
                                {
                                        // probably a valid bit.
                                        int hiDuration = hiToLoTime - loToHiTime;

                                        if (lowDuration < 0)
                                        {
                                                hiDuration += 1000000000;
                                        }

                                        if (lowDuration > THRESHOLD)
                                        {
                                                bits[bitIndex]= '1';
                                        }
                                        else
                                        {
                                                bits[bitIndex]= '0';
                                        }
                                        
					bitIndex ++;

                                        if (bitIndex == 64)
                                        {
                                                //printf("Missed L->H:%d    Missed H->L:%d    Wrong Time:%d\n", missedLoToHi, missedHiToLo, wrongTime);
                                                missedLoToHi = missedHiToLo = wrongTime = 0;
                                                bits[bitIndex] = '\0';
                                                //system("date");
                                                printf("%s\n",bits);
						int i = 0;
						int idcode = 0;
						for (int a = 0; a < 52; a = a +2)
						{
							IDdevice[i] = bits[a];
							if (IDdevice[i] == '1')
							{
								idcode = idcode + pow(2,25-i);
							}
							i++;
						}
						IDdevice[i] = '\0';
						i = 0;
						for (int a = 56; a < 63; a = a +2)
                                                {
                                                        Codedevice[i] = bits[a];
                                                        i++;
                                                }
                                                Codedevice[i] = '\0';
						printf("%s : %c : %c : %s\n",IDdevice,bits[52],bits[54],Codedevice);
						printf("Identifiant emeteur :%d\n",idcode);
                                                bitIndex = 0;
                                                fflush(stdout);

                                                return 0;
                                        }
                                }
                        }
                }
        }
        return 0;
}

